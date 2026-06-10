import { getProducto, getReseñas } from "../../../lib/api";
import ProductoClient from "./ProductoClient";

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  let producto = null;
  let reseñas: any[] = [];

  try {
    producto = await getProducto(id);
    reseñas = await getReseñas(id);
  } catch {}

  if (!producto) {
    return (
      <main className="p-6 text-center">
        <p className="text-red-500 text-xl">Producto no encontrado</p>
      </main>
    );
  }

  return <ProductoClient producto={producto} reseñasIniciales={reseñas} />;
}