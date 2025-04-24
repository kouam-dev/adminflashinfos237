import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const maxDuration = 60; // 60 secondes max pour l'exécution
export const dynamic = 'force-dynamic'; // Ne pas mettre en cache cette route

export async function POST(request: NextRequest) {
  console.log("API Upload appelée");

  try {
    // Vérification des variables d'environnement
    if (!process.env.AWS_ACCESS_KEY_ID_ || 
        !process.env.AWS_SECRET_ACCESS_KEY_ || 
        !process.env.AWS_REGION_ || 
        !process.env.S3_BUCKET_NAME) {
      console.error("Variables d'environnement AWS manquantes");
      return NextResponse.json({ 
        message: "Erreur de configuration du serveur: Variables d'environnement AWS non définies"
      }, { status: 500 });
    }

    // Lecture du body avec gestion d'erreur
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      return NextResponse.json({ 
        message: "Le corps de la requête n'est pas du JSON valide" 
      }, { status: 400 });
    }

    const { file, fileType } = body;

    // Vérification des données
    if (!file) {
      return NextResponse.json({ message: 'Image requise' }, { status: 400 });
    }
    
    if (!fileType) {
      return NextResponse.json({ message: 'Type de fichier requis' }, { status: 400 });
    }

    if (!fileType.includes('image/')) {
      return NextResponse.json({ message: 'Le fichier doit être une image' }, { status: 400 });
    }

    // Traitement de l'image base64
    let fileContent: Buffer;
    try {
      // Extraire le contenu du fichier de la chaîne base64
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      fileContent = Buffer.from(base64Data, 'base64');
      
      // Vérification que le buffer a bien été créé
      if (fileContent.length === 0) {
        throw new Error('Buffer vide après décodage base64');
      }
      
      console.log(`Image décodée avec succès: ${fileContent.length} octets`);
    } catch (error) {
      console.error("Erreur lors du décodage base64:", error);
      return NextResponse.json({ 
        message: 'Format de fichier invalide - Erreur de décodage base64'
      }, { status: 400 });
    }

    // Configuration et initialisation du client S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION_,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_,
      },
    });

    // Préparation du nom de fichier et des paramètres
    const fileExtension = fileType.split('/')[1];
    const fileName = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    // Retrait de l'option ACL qui peut causer des problèmes
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: fileType
    };

    // Upload vers S3
    try {
      console.log(`Tentative d'upload vers S3 bucket: ${process.env.S3_BUCKET_NAME}, filename: ${fileName}`);
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      console.log("Upload S3 réussi!");
      
      // Construction de l'URL
      const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION_}.amazonaws.com/${fileName}`;
      
      // Retourner le succès
      return NextResponse.json({
        success: true,
        imageUrl,
      });
    } catch (uploadError: unknown) {
      console.error("Erreur d'upload S3 détaillée:", {
        message: uploadError instanceof Error && uploadError.message,
        code: uploadError instanceof Error &&  uploadError.cause,
        name: uploadError instanceof Error && uploadError.name
      });
      
      return NextResponse.json({
        message: "Erreur lors de l'upload vers S3",
        error: uploadError instanceof Error && uploadError.message || "Erreur inconnue"
      }, { status: 500 });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      message: 'Erreur serveur lors du traitement de la requête',
      error: error instanceof Error && error.message || "Erreur inconnue"
    }, { status: 500 });
  }
}