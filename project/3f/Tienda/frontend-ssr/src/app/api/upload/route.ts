import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary en producción (Vercel), filesystem en local (Docker)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'boutique-regalos', resource_type: 'image' },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });
      return NextResponse.json({ url: result.secure_url });
    }

    // Fallback local: guardar en public/uploads
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${(file as any).name?.replace(/[^a-zA-Z0-9._-]/g, '-') || 'imagen'}`;
    await fs.promises.writeFile(path.join(uploadsDir, safeName), buffer);
    return NextResponse.json({ url: `/uploads/${safeName}` });

  } catch (err: any) {
    return NextResponse.json(
      { error: 'upload error', message: err?.message || String(err) },
      { status: 500 }
    );
  }
}