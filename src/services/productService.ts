import axios from 'axios'
import { API_URL } from '../constants'

export const getProductByCode = async (code: string) => {
  return await axios.get(`${API_URL}/productos/publico?busqueda=${code}`)
}
