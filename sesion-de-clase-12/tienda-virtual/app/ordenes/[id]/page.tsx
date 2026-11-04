import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { obtenerPedidoPorId } from "@/lib/api/ordenes";
import { getResenasEntregaPorOrdenes } from "@/lib/api/comentarios";
import { Orden } from "@/lib/modelo/orden";
import Estrellas from "@/app/components/Estrellas";

interface OrdenDetallePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ confirmacion?: string }>;
}

const fechaFormatter = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });

export default async function OrdenDetallePage({ params, searchParams }: OrdenDetallePageProps) {
  const { id } = await params;
  const { confirmacion } = (await searchParams) ?? {};
  const ordenId = Number(id);

  let orden: Orden;
  try {
    orden = await obtenerPedidoPorId(ordenId);
  } catch {
    notFound();
  }

  const resenasPorOrden = await getResenasEntregaPorOrdenes([orden.id]);
  const resenas = resenasPorOrden.get(orden.id) ?? [];
  const fechaIso = orden.fecha.toISOString().slice(0, 10);
  const cliente = orden.carrito.cliente;

  // GA4: purchase solo al llegar desde "Crear orden" (?confirmacion=1).
  // transaction_id = numero de orden (GA4 descarta compras con transaction_id repetido).
  // value = suma de price x quantity; el IGV va en tax. Sin datos del cliente.
  const purchaseGA = {
    transaction_id: orden.numero,
    currency: "PEN",
    value: orden.subTotal,
    tax: orden.igv,
    items: (orden.items ?? []).map((item) => ({
      item_id: item.producto.codigo,
      item_name: item.producto.nombre,
      item_category: item.producto.categoria,
      item_category2: item.producto.subcategoria,
      price: item.producto.precio,
      quantity: item.cantidad,
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Order",
    "@id": `orden-${orden.id}`,
    orderNumber: orden.numero,
    orderDate: fechaIso,
    orderStatus: "https://schema.org/OrderDelivered",
    customer: {
      "@type": "Person",
      name: `${cliente.nombre} ${cliente.apellidos}`,
    },
    acceptedOffer: (orden.items ?? []).map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: item.producto.nombre, sku: item.producto.codigo },
      price: item.producto.precio,
      priceCurrency: "PEN",
      eligibleQuantity: { "@type": "QuantitativeValue", value: item.cantidad },
    })),
    priceSpecification: {
      "@type": "PriceSpecification",
      price: orden.total,
      priceCurrency: "PEN",
    },
  };

  return (
    <section
      id={`orden-${orden.id}`}
      data-orden-id={orden.id}
      data-numero={orden.numero}
      data-fecha={fechaIso}
      data-cliente-id={cliente.id}
      data-sub-total={orden.subTotal}
      data-igv={orden.igv}
      data-total={orden.total}
      itemScope
      itemType="https://schema.org/Order"
      className="space-y-6"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {confirmacion && (
        <Script id={`ga-purchase-${orden.id}-${Date.now()}`}>{`
          // Confirmacion del pedido: purchase una sola vez (si se recarga la pagina no se reenvia)
          var purchaseGA = ${JSON.stringify(purchaseGA).replace(/</g, "\\u003c")};
          var claveCompra = 'ga4_purchase_' + purchaseGA.transaction_id;
          var yaEnviada = false;
          try { yaEnviada = sessionStorage.getItem(claveCompra) === '1'; } catch (e) {}
          if (!yaEnviada) {
            gtag('event', 'purchase', purchaseGA);
            try { sessionStorage.setItem(claveCompra, '1'); } catch (e) {}
          }
        `}</Script>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/ordenes" className="hover:text-blue-600">
            Ordenes
          </Link>
          <span className="mx-1">/</span>
          <span>{orden.numero}</span>
        </nav>

        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Numero de orden</p>
            <h2 className="text-3xl font-bold text-gray-800" itemProp="orderNumber">
              {orden.numero}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Fecha: <time dateTime={fechaIso}>{fechaFormatter.format(orden.fecha)}</time>
            </p>
          </div>
          <Link
            href={`/ordenes?clienteId=${cliente.id}`}
            className="rounded-md bg-gray-200 px-4 py-2 text-center text-sm text-gray-800 hover:bg-gray-300"
          >
            Ver otras ordenes de este cliente
          </Link>
        </header>

        <div
          className="rounded-md bg-gray-50 p-4"
          itemProp="customer"
          itemScope
          itemType="https://schema.org/Person"
        >
          <p className="text-xs font-semibold uppercase text-gray-500">Cliente</p>
          <p className="text-lg font-semibold text-gray-900" itemProp="name">
            {cliente.nombre} {cliente.apellidos}
          </p>
          <p className="text-sm text-gray-600">
            {cliente.dni} &middot; {cliente.ciudad}, {cliente.pais}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Producto</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Cantidad</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Precio unitario</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.items?.map((item) => (
                <tr
                  key={item.id}
                  data-producto-id={item.producto.id}
                  data-cantidad={item.cantidad}
                  className="border-t border-gray-200"
                  itemProp="orderedItem"
                  itemScope
                  itemType="https://schema.org/OrderItem"
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <Link href={`/productos/${item.producto.id}`} className="hover:text-blue-600 hover:underline" itemProp="orderedItem">
                      {item.producto.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900" itemProp="orderQuantity">
                    {item.cantidad}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">S/ {item.producto.precio.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">S/ {item.subTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-right text-sm font-medium text-gray-700">
          <span>Subtotal: S/ {orden.subTotal.toFixed(2)}</span>
          <span>IGV (18%): S/ {orden.igv.toFixed(2)}</span>
          <span className="text-base font-bold text-gray-900" itemProp="price">
            Total: S/ {orden.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-2xl font-bold text-gray-800">Resenas de entrega</h3>

        {resenas.length === 0 ? (
          <p className="text-gray-600">Esta orden todavia no tiene resenas de entrega.</p>
        ) : (
          <ul className="space-y-3" data-resenas-count={resenas.length}>
            {resenas.map((resena) => (
              <li
                key={resena.id}
                id={`comentario-${resena.id}`}
                data-comentario-id={resena.id}
                data-tipo="post_compra"
                data-orden-id={orden.id}
                data-cliente-id={resena.clienteId}
                data-producto-id={resena.productoId ?? ""}
                data-calificacion={resena.calificacion}
                data-fecha={resena.fecha}
                itemProp="review"
                itemScope
                itemType="https://schema.org/Review"
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-800" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">
                      {resena.clienteNombre} {resena.clienteApellidos}
                    </span>
                    {resena.productoNombre && <span className="font-normal text-gray-500"> - {resena.productoNombre}</span>}
                  </p>
                  <time className="text-xs text-gray-500" dateTime={resena.fecha} itemProp="datePublished">
                    {fechaFormatter.format(new Date(resena.fecha))}
                  </time>
                </div>
                <div className="mb-2" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                  <meta itemProp="worstRating" content="1" />
                  <meta itemProp="bestRating" content="5" />
                  <Estrellas calificacion={resena.calificacion} />
                  <meta itemProp="ratingValue" content={String(resena.calificacion)} />
                </div>
                <p className="text-sm text-gray-700" itemProp="reviewBody">
                  {resena.texto}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
