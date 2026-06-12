/**
 * Product gallery component
 */

export default function ProductGallery({ images, productName }) {
  if (images.length === 0) {
    return <p className="detail-state">This product does not have images yet.</p>
  }

  return (
    <div className="detail-gallery-grid">
      {images.map((image) => (
        <figure key={image.id} className="detail-gallery-item">
          <img src={image.image_url} alt={image.alt_text || productName} loading="lazy" />
          {image.alt_text && <figcaption>{image.alt_text}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
