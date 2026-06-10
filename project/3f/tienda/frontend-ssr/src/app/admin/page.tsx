"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { showToast } from "../../components/Toast";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
// Use the auto bundle which registers required components automatically
import Chart from "chart.js/auto";
import { getCookie } from "cookies-next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AdminPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "", imagen1: "", imagen2: "", imagen3: "" });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Upload a selected file to /api/upload and set the returned URL into the form
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, campo: string) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(f => ({ ...f, [campo]: data.url }));
        showToast('Imagen subida', 'success');
      } else {
        console.error(data);
        showToast('Error subiendo imagen', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen', 'error');
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!chartRef.current || items.length === 0) return;
    const vendidos: Record<string, number> = {};
    items.forEach((i: any) => {
      vendidos[i.product_id] = (vendidos[i.product_id] || 0) + i.cantidad;
    });
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(vendidos),
        datasets: [{ label: "Cantidad vendida", data: Object.values(vendidos), backgroundColor: "#FBBF24" }],
      },
      options: { responsive: true },
    });
  }, [items]);

  async function cargarDatos() {
    const token = getCookie("token");
    try {
      const [pRes, oRes] = await Promise.all([
        fetch(`${API}/api/products`),
        fetch(`${API}/api/orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
      ]);
      const pData = await pRes.json();
      if (!pRes.ok) {
        console.error("Error GET /api/products:", pData);
        showToast("Error obteniendo productos", "error");
        setProductos([]);
      } else if (!Array.isArray(pData)) {
        console.error("Products endpoint returned non-array:", pData);
        showToast("Respuesta inválida de productos", "error");
        setProductos([]);
      } else {
        setProductos(pData);
      }

      const oData = await oRes.json();
      if (!oRes.ok || typeof oData !== "object") {
        console.error("Error GET /api/orders:", oData);
        showToast("Error obteniendo órdenes", "error");
        setOrdenes([]);
        setItems([]);
      } else {
        setOrdenes(oData.orders || []);
        setItems(oData.items || []);
      }
    } catch { showToast("Error cargando datos", "error"); }
  }

  async function crearProducto() {
    if (!form.nombre || !form.precio) {
      showToast("Nombre y precio son obligatorios", "warning");
      return;
    }
    const token = getCookie("token");

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error creating product:", data);
        showToast(data.error || "Error creando producto", "error");
        return;
      }
      showToast("✅ Producto creado correctamente", "success");
      setForm({ nombre: "", descripcion: "", precio: "", stock: "", imagen1: "", imagen2: "", imagen3: "" });
      cargarDatos();
    } catch { showToast("Error creando producto", "error"); }
  }

  async function cambiarPrecio(id: number) {
    const nuevo = prompt("Nuevo precio:");
    if (!nuevo) return;
    
    const token = getCookie("token");

    try {
      await fetch(`${API}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ precio: parseFloat(nuevo) }),
      });
      showToast("Precio actualizado", "success");
      cargarDatos();
    } catch { showToast("Error actualizando precio", "error"); }
  }

  async function eliminarProducto(id: number) {
    if (!confirm("¿Eliminar producto?")) return;
    const token = getCookie("token");
    try {
      await fetch(`${API}/api/products/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      showToast("Producto eliminado", "info");
      cargarDatos();
    } catch { showToast("Error eliminando producto", "error"); }
  }

  const totalVentas = ordenes.reduce((s: number, o: any) => s + o.total, 0);

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-10">
      <Link href="/" className="inline-block mb-2 text-yellow-500 hover:underline text-sm">← Volver a la tienda</Link>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Total Ventas</p>
          <p className="text-4xl font-bold text-green-500">${totalVentas}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Número de Órdenes</p>
          <p className="text-4xl font-bold text-yellow-400">{ordenes.length}</p>
        </div>
      </div>

      {/* Crear Producto */}
      <div>
        <h2 className="text-2xl font-alfa text-yellow-500 mb-4">Crear Producto</h2>
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
          {["nombre", "descripcion", "imagen1", "imagen2", "imagen3"].map(campo => (
              campo === "descripcion" ? (
                <FormInput key={campo} textarea rows={3} placeholder="Descripción" value={(form as any)[campo]}
                  onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))} />
              ) : (campo.startsWith("imagen") ? (
                <div key={campo} className="space-y-2">
                  <FormInput placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                    value={(form as any)[campo]}
                    onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))} />
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e as any, campo)}
                      className="text-sm" />
                    <span className="text-xs text-gray-400">Sube una imagen y se guardará en /uploads</span>
                  </div>
                </div>
              ) : (
                <FormInput key={campo} placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                  value={(form as any)[campo]}
                  onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))} />
              ))
          ))}
          <div className="grid grid-cols-2 gap-4">
            <FormInput type="number" placeholder="Precio" value={form.precio}
              onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
            <FormInput type="number" placeholder="Stock" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
          </div>
          <Button onClick={crearProducto} className="w-full bg-yellow-400 hover:bg-yellow-500 py-3">
            Crear producto ✨
          </Button>
        </div>
      </div>

      {/* Lista productos */}
      <div>
        <h2 className="text-2xl font-alfa text-yellow-500 mb-4">Gestión de Productos</h2>
        <div className="space-y-4">
          {productos.map((p: any) => (
            <div key={p.id} className="bg-white shadow p-4 rounded-xl flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-gray-800">{p.nombre}</p>
                <p className="text-yellow-500 font-bold">${p.precio}</p>
                <p className={`text-xs mt-1 ${p.stock <= 5 ? "text-red-400" : "text-gray-400"}`}>
                  Stock: {p.stock} {p.stock <= 5 ? "⚠️" : "✅"}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => cambiarPrecio(p.id)} className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 text-sm">
                  Editar precio
                </Button>
                <Button onClick={() => eliminarProducto(p.id)} className="bg-red-400 hover:bg-red-500 px-3 py-1 text-sm">
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-alfa text-yellow-500 mb-4">Productos Vendidos</h2>
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Tabla órdenes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-alfa text-yellow-500 mb-4">Órdenes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-yellow-50 text-yellow-600">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordenes.map((o: any) => (
                <tr key={o.id} className="hover:bg-pink-50 transition">
                  <td className="p-3 text-gray-500">#{o.id}</td>
                  <td className="p-3">{new Date(o.fecha).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-green-500">${o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}