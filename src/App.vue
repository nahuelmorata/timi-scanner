<script setup lang="ts">
import axios from 'axios';
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { API_URL } from './constants';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const codigo = ref('');
const productoNoEncontrado = ref(false);
const mostrandoCamara = ref(false);
const productoSeleccionado = ref<{ nombre: string; precio: number } | null>(null);
const cameraError = ref<string | null>(null);
const mostrarPlaceholder = ref(true);


let scanner: Html5Qrcode | null = null;


const searchProduct = () => {
  axios.get(`${API_URL}/productos/publico?busqueda=${codigo.value}`)
    .then(response => {
      if (response.status === 204 || !response.data) {
        productoSeleccionado.value = null;
        productoNoEncontrado.value = true;
        return;
      }

      productoSeleccionado.value = response.data;
      productoNoEncontrado.value = false;
    })
    .catch(error => {
      console.error(error);
      productoNoEncontrado.value = true;
    });
};

const openCamera = async () => {
  cameraError.value = null;
  mostrandoCamara.value = true;
  await nextTick();
  await startScanner();
};

const startScanner = async () => {
  if (!scanner) {
    scanner = new Html5Qrcode('reader', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8
      ],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      verbose: true
    });
  }

  try {
    const camaras = await Html5Qrcode.getCameras();
    await scanner.start(
      camaras == null || camaras.length === 0 ? { facingMode: 'environment' } : camaras[1]!.id,
      {
        fps: 10,
        //qrbox: { width: 320, height: 160 }
      },
      (decodedText) => {
        codigo.value = decodedText;
        stopScanner();
        searchProduct();
      },
      () => { }
    );
    mostrarPlaceholder.value = false;
  } catch (err: any) {
    console.error(err);
    cameraError.value = err?.message ?? 'No se pudo iniciar la cámara';
    mostrandoCamara.value = false;
  }
};

const stopScanner = async () => {
  if (scanner) {
    try {
      mostrarPlaceholder.value = true;
      await scanner.stop();
      scanner.clear();
    } catch (err) {
      console.warn('Scanner stop error', err);
    }
  }
  mostrandoCamara.value = false;
};

onBeforeUnmount(() => {
  if (scanner) {
    scanner.stop().catch(() => { });
  }
});

const clearProduct = () => {
  productoSeleccionado.value = null;
  productoNoEncontrado.value = false;
};
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen bg-orange-300 gap-4 p-4">
    <img src="/logo.svg" alt="Logo" class="w-60 mb-4"></img>
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

    <div v-if="mostrandoCamara" class="mt-4 flex flex-col items-center gap-2">
      <div id="reader" style="width: 320px; max-width: 100%;"></div>
      <img v-if="mostrarPlaceholder" src="https://placehold.co/320?text=Preparando..." alt="Placeholder">

      <button @click="stopScanner" class="bg-red-500 text-white px-3 py-1 rounded">
        Cancelar
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

    <div v-else-if="productoNoEncontrado" class="bg-white rounded-lg shadow-lg p-8 text-center text-red-500">
      <p>Producto no encontrado</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-lg p-8 text-center text-gray-400">
      <p>Ingresa un código para buscar el producto</p>
    </div>
  </div>
</template>

<style scoped></style>
