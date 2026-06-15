import { Client } from 'minio';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const minioClient = new Client({
  endPoint:  process.env.MINIO_ENDPOINT  || 'minio',
  port:      parseInt(process.env.MINIO_PORT || '9000'),
  useSSL:    false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'admin123',
});

const BUCKET = 'products';

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    // Política de lectura pública para que las imágenes sean accesibles desde el browser
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect:    'Allow',
        Principal: { AWS: ['*'] },
        Action:    ['s3:GetObject'],
        Resource:  [`arn:aws:s3:::${BUCKET}/*`],
      }],
    }));
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const buffer   = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const mimeType = file.type || 'application/octet-stream';

    await ensureBucket();
    await minioClient.putObject(BUCKET, safeName, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    const publicUrl = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET}/${safeName}`;
    return NextResponse.json({ url: publicUrl });

  } catch (err: any) {
    console.error('[MinIO upload error]', err);
    return NextResponse.json({ error: 'upload error', message: err?.message }, { status: 500 });
  }
}