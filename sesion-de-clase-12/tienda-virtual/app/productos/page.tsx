import Link from "next/link";
import Script from "next/script";
import { eliminarProductoAction } from "@/app/actions/productos";
import { getProductosPaginado } from "@/lib/api/productos";
import { getRatingsPorProductos } from "@/lib/api/comentarios";
import Pagination from "@/app/components/Pagination";
import Estrellas from "@/app/components/Estrellas";

interface ProductosPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const query = (await searchParams) ?? {};
  const pageParam = Number(query.page) || 1;
  const { items: productos, page, totalPages, total, pageSize } = await getProductosPaginado(pageParam);
  const ratings = await getRatingsPorProductos(productos.map((producto) => producto.id));

  // GA4: items de la lista (campos del producto, sin datos personales).
  const listaGA = { item_list_id: "catalogo", item_list_name: "Catalogo de productos" };
  const productosGA = productos.map((producto, index) => ({
    id: producto.id,
    item: {
    item_id: producto.codigo,
    item_name: producto.nombre,
    item_category: producto.categoria,
    item_category2: producto.subcategoria,
    price: producto.precio,
    quantity: 1,
    index: (page - 1) * pageSize + index,
    ...listaGA,
    },
  }));

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      {productos.length > 0 && (
        <Script id={`ga-view-item-list-${page}-${Date.now()}`}>{`
          var lista = ${JSON.stringify(listaGA)};
          var productosGA = ${JSON.stringify(productosGA).replace(/</g, "\\u003c")};

          // Se muestra la lista de productos
          gtag('event', 'view_item_list', {
            item_list_id: lista.item_list_id,
            item_list_name: lista.item_list_name,
            items: productosGA.map(function (p) { return p.item; })
          });

          // Clic en un producto de la lista
          productosGA.forEach(function (p) {
            document.querySelectorAll('#producto-fila-' + p.id + ' a[href="/productos/' + p.id + '"]').forEach(function (enlace) {
              enlace.onclick = function () {
                gtag('event', 'select_item', {
                  item_list_id: lista.item_list_id,
                  item_list_name: lista.item_list_name,
                  items: [p.item]
                });
              };
            });
          });
        `}</Script>
      )}
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
        <Link
          href="/productos/nuevo"
          className="rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Nuevo producto
        </Link>
      </header>

      {productos.length === 0 ? (
        <p className="text-gray-600">No hay productos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse overflow-hidden rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Codigo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Descripcion</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Calificacion</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const rating = ratings.get(producto.id);
                return (
                <tr
                  key={producto.id}
                  id={`producto-fila-${producto.id}`}
                  data-producto-id={producto.id}
                  data-codigo={producto.codigo}
                  data-categoria={producto.categoria}
                  data-subcategoria={producto.subcategoria}
                  data-precio={producto.precio}
                  data-stock={producto.stock}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{producto.codigo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link href={`/productos/${producto.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                      {producto.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{producto.descripcion}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">S/ {producto.precio.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{producto.stock}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {rating ? (
                      <div className="flex items-center gap-1">
                        <Estrellas calificacion={rating.promedio} />
                        <span className="text-xs text-gray-500">({rating.total})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin resenas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Link href={`/productos/${producto.id}`} className="font-medium text-gray-600 hover:text-gray-900">
                        Ver
                      </Link>
                      <Link
                        href={`/productos/${producto.id}/editar`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <form action={eliminarProductoAction}>
                        <input type="hidden" name="id" value={producto.id} />
                        <button className="font-medium text-red-600 hover:text-red-800" type="submit">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination basePath="/productos" page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
      </div>
    </section>
  );
}
