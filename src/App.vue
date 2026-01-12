<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCamera } from '@fortawesome/free-solid-svg-icons'
import CustomSelect from './components/CustomSelect.vue'
import type { SelectOption } from './components/types'
import { useScanner } from './composables/useScanner'
import { getProductByCode } from './services/productService'
import type { Interes, Product } from './types'

const {
  codigo,
  mostrandoCamara,
  cameraError,
  mostrarPlaceholder,
  startScanner,
  stopScanner
} = useScanner()

const productoNoEncontrado = ref(false)
const productoSeleccionado = ref<Product | null>(null)
const interes = ref<Interes[]>([
  { id: 1, nombre: 'Efectivo/Transf/QR/Debito', valor: 0.9 },
  { id: 2, nombre: 'Precio de lista', valor: 1 },
])
const selectOptionInteres = computed(() =>
  interes.value.map((i) => ({ id: i.id, label: i.nombre, value: i }) as SelectOption<Interes>),
)
const interesSeleccionado = ref<Interes>(interes.value[1]!)
const cameraContainerRef = ref<HTMLElement | null>(null)

const searchProduct = async () => {
  let response
  try {
    response = await getProductByCode(codigo.value)
  } catch (error) {
    console.error(error)
    productoNoEncontrado.value = true
    return
  }

  if (response.status === 204 || !response.data) {
    productoSeleccionado.value = null
    productoNoEncontrado.value = true
    return
  }

  productoSeleccionado.value = response.data
  productoNoEncontrado.value = false
}

const openCamera = async () => {
  startScanner(async () => {
    await searchProduct()
  })
  await bringCameraContainerIntoView()
}

const bringCameraContainerIntoView = async () => {
  await nextTick()
  const el = cameraContainerRef.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
}

const clearProduct = () => {
  productoSeleccionado.value = null
  productoNoEncontrado.value = false
}
</script>

<template>
  <div class="flex flex-col items-center bg-orange-300 gap-4 p-4 overflow-y-auto min-h-dvh">
    <img src="/logo.svg" alt="Logo" class="w-60 mb-4" />
    <h1 class="text-3xl text-blue-900 font-bold">Lector de códigos</h1>

    <div class="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col gap-4">
      <button @click="openCamera"
        class="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold w-full">
        Escanear código
        <FontAwesomeIcon :icon="faCamera" />
      </button>
      <div class="flex gap-4">
        <input v-model="codigo" @keyup.enter="searchProduct" type="text" placeholder="Ingresa el código..."
          class="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg focus:outline-none focus:border-orange-300" />
      </div>
      <button @click="searchProduct"
        class="w-full bg-orange-300 hover:bg-orange-400 text-blue-900 font-bold py-3 rounded-lg">
        Buscar
      </button>
    </div>

    <div v-if="cameraError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ cameraError }}</span>
    </div>

    <div v-if="mostrandoCamara" ref="cameraContainerRef" class="mt-4 flex flex-col items-center gap-2">
      <div class="relative overflow-hidden rounded-lg" style="width: 320px; height: 320px">
        <div id="reader" tabindex="-1" class="w-full h-full"></div>
        <div v-if="!mostrarPlaceholder"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-500 rounded-lg box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style="width: 90%; height: 160px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);">
        </div>
      </div>
      <img v-if="mostrarPlaceholder" src="https://placehold.co/320?text=Preparando..." alt="Placeholder" />

      <button @click="stopScanner" tabindex="-1" type="button" class="bg-red-500 text-white px-3 py-1 rounded">
        Cancelar
      </button>
    </div>

    <div v-if="productoSeleccionado" class="bg-white rounded-lg shadow-lg p-8 text-center flex flex-col gap-8">
      <h2 class="text-xl font-bold text-blue-900">
        {{ productoSeleccionado.nombre }}
      </h2>

      <div class="bg-orange-300 rounded-lg p-6">
        <p class="text-xl text-blue-900 mb-2">Precio</p>
        <p class="text-3xl font-bold text-blue-900">
          ${{ (productoSeleccionado.precio * interesSeleccionado.valor).toFixed(2) }}
        </p>
      </div>

      <CustomSelect v-model="interesSeleccionado" :options="selectOptionInteres" @change="searchProduct" />

      <button @click="clearProduct"
        class="w-full bg-gray-300 hover:bg-gray-400 text-blue-900 font-semibold py-2 rounded-lg transition">
        Limpiar
      </button>
    </div>

    <div v-else-if="productoNoEncontrado" class="bg-white rounded-lg shadow-lg p-8 text-center text-red-500">
      <p>Producto no encontrado</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-lg p-8 text-center text-gray-400">
      <p>Ingresa un código para buscar el producto</p>
    </div>
  </div>
</template>
