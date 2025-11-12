<script setup lang="ts">
import { ref } from 'vue';

const codigo = ref('');
const productoSeleccionado = ref<{ nombre: string; precio: number } | null>(null);

const searchProduct = () => {
  productoSeleccionado.value = {
    nombre: 'Producto 1',
    precio: 100
  };
};

const openCamera = () => {
  alert('Abriendo cámara');
};

const clearProduct = () => {
  productoSeleccionado.value = null;
};
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen bg-orange-300 gap-4 p-4">
    <h1 class="text-3xl text-blue-900 font-bold">Lector de códigos</h1>

    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex gap-3 mb-4">
        <input v-model="codigo" @keyup.enter="searchProduct" type="text" placeholder="Ingresa el código..."
          class="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg focus:outline-none focus:border-orange-300" />
        <button @click="openCamera"
          class="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition">
          📷
        </button>
      </div>
      <button @click="searchProduct"
        class="w-full bg-orange-300 hover:bg-orange-400 text-blue-900 font-bold py-3 rounded-lg transition">
        Buscar
      </button>
    </div>

    <div v-if="productoSeleccionado" class="bg-white rounded-lg shadow-lg p-8 text-center">

      <h2 class="text-2xl font-bold text-blue-900 mb-4">
        {{ productoSeleccionado.nombre }}
      </h2>

      <div class="bg-orange-300 rounded-lg p-6">
        <p class="text-sm text-blue-900 mb-2">Precio</p>
        <p class="text-4xl font-bold text-blue-900">
          ${{ productoSeleccionado.precio.toFixed(2) }}
        </p>
      </div>

      <button @click="clearProduct"
        class="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-blue-900 font-semibold py-2 rounded-lg transition">
        Limpiar
      </button>
    </div>

    <div v-else class="bg-white rounded-lg shadow-lg p-8 text-center text-gray-400">
      <p>Ingresa un código para buscar el producto</p>
    </div>
  </div>
</template>

<style scoped></style>
