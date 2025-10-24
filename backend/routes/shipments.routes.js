const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'enviosdb1';

router.post('/create', async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const guias = db.collection('guias_envio');
    const resumen = db.collection('resumen_envio');

    const shipment = req.body;

    // Validar datos requeridos
    if (!shipment.recipient || !shipment.pricing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos incompletos. Se requiere información del destinatario y precios.' 
      });
    }

    // Generar número de seguimiento único si no viene
    const trackingNumber = shipment.tracking_number || `DS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Preparar documento completo para guias_envio
    const guiaCompleta = {
      tracking_number: trackingNumber,
      sender: shipment.sender,
      recipient: shipment.recipient,
      package_details: shipment.package_details,
      service_type: shipment.service_type,
      pricing: shipment.pricing,
      payment: shipment.payment,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Guardar la guía completa
    const resultGuia = await guias.insertOne(guiaCompleta);
    console.log('✅ Guía completa guardada en guias_envio:', trackingNumber);

    // Preparar resumen para resumen_envio
    const resumenEnvio = {
      numero_guia: trackingNumber,
      guia_id: resultGuia.insertedId,
      
      // Datos del destinatario
      nombre_destinatario: shipment.recipient.name,
      telefono_destinatario: shipment.recipient.phone,
      correo_destinatario: shipment.recipient.email || 'No proporcionado',
      direccion_destinatario: shipment.recipient.address.street,
      departamento_destino: shipment.recipient.address.department,
      municipio_destino: shipment.recipient.address.municipality,
      
      // Datos del remitente
      nombre_remitente: shipment.sender.name,
      telefono_remitente: shipment.sender.phone,
      departamento_origen: shipment.sender.address.department,
      
      // Datos del paquete
      peso_kg: shipment.package_details.weight,
      tipo_paquete: shipment.package_details.type_id,
      valor_declarado: shipment.package_details.value,
      es_fragil: shipment.package_details.fragile || false,
      
      // Costos
      costo_base: shipment.pricing.base_cost,
      costo_distancia: shipment.pricing.distance_cost,
      costo_peso: shipment.pricing.weight_cost,
      costo_servicio: shipment.pricing.service_cost,
      costo_seguro: shipment.pricing.insurance_cost,
      costo_total: shipment.pricing.total_cost,
      moneda: shipment.pricing.currency || 'GTQ',
      
      // Servicio y estado
      tipo_servicio: shipment.service_type,
      metodo_pago: shipment.payment.method,
      estado_pago: shipment.payment.status || 'pending',
      status: 'pending',
      
      // Fechas
      fecha_creacion: new Date(),
      fecha_registro: new Date()
    };

    // Guardar resumen
    await resumen.insertOne(resumenEnvio);
    console.log('✅ Resumen guardado en resumen_envio:', trackingNumber);

    // También guardar en shipments (colección original)
    await db.collection('shipments').insertOne(guiaCompleta);

    // Crear registro de seguimiento
    await db.collection('tracking').insertOne({
      shipment_id: resultGuia.insertedId,
      tracking_number: trackingNumber,
      status: 'created',
      events: [
        {
          date: new Date(),
          description: 'Envío creado',
          location: `${shipment.recipient.address.municipality}, ${shipment.recipient.address.department}`,
          status: 'created'
        }
      ],
      created_at: new Date()
    });

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: '✅ Envío guardado correctamente',
      guide: {
        id: resultGuia.insertedId,
        tracking_number: trackingNumber,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Error al guardar envío:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    await client.close();
  }
});

// Endpoint para obtener todos los envíos
router.get('/', async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const guias = db.collection('guias_envio');
    
    const shipments = await guias.find({}).sort({ created_at: -1 }).toArray();
    
    res.json({
      success: true,
      count: shipments.length,
      shipments: shipments
    });
  } catch (error) {
    console.error('❌ Error al obtener envíos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener envíos'
    });
  } finally {
    await client.close();
  }
});

// Endpoint para obtener un envío por tracking number
router.get('/:tracking', async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const guias = db.collection('guias_envio');
    
    const shipment = await guias.findOne({ tracking_number: req.params.tracking });
    
    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Envío no encontrado'
      });
    }
    
    res.json({
      success: true,
      shipment: shipment
    });
  } catch (error) {
    console.error('❌ Error al buscar envío:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al buscar envío'
    });
  } finally {
    await client.close();
  }
});

module.exports = router;
