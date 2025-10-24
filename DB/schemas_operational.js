/**
 *  ESQUEMAS OPERACIONALES
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo define los esquemas para payment_methods, transactions,
 * notifications y system_logs del sistema operacional.
 */

const { ObjectId } = require('mongodb');

/**
 *  ESQUEMA DE MÉTODOS DE PAGO
 */
const PaymentMethodSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["code", "name", "type", "processor"],
            properties: {
                code: {
                    bsonType: "string",
                    pattern: "^[A-Z_]+$",
                    minLength: 2,
                    maxLength: 20,
                    description: "Código único del método de pago"
                },
                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre del método de pago"
                },
                display_name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre para mostrar al usuario"
                },
                type: {
                    bsonType: "string",
                    enum: ["cash", "card", "bank_transfer", "digital_wallet", "cryptocurrency", "credit"],
                    description: "Tipo de método de pago"
                },
                processor: {
                    bsonType: "string",
                    enum: ["internal", "visa", "mastercard", "amex", "paypal", "stripe", "banrural", "bac", "industrial"],
                    description: "Procesador de pagos"
                },
                configuration: {
                    bsonType: "object",
                    properties: {
                        api_endpoint: { bsonType: "string", maxLength: 200 },
                        merchant_id: { bsonType: "string", maxLength: 100 },
                        public_key: { bsonType: "string", maxLength: 200 },
                        sandbox_mode: { bsonType: "bool" },
                        supported_currencies: {
                            bsonType: "array",
                            items: { bsonType: "string", enum: ["GTQ", "USD", "EUR"] }
                        },
                        minimum_amount: { bsonType: "double", minimum: 0 },
                        maximum_amount: { bsonType: "double", minimum: 0 },
                        processing_fee_percent: { bsonType: "double", minimum: 0, maximum: 10 },
                        fixed_fee: { bsonType: "double", minimum: 0 }
                    }
                },
                features: {
                    bsonType: "object",
                    properties: {
                        instant_confirmation: { bsonType: "bool" },
                        refund_supported: { bsonType: "bool" },
                        partial_refund: { bsonType: "bool" },
                        recurring_payments: { bsonType: "bool" },
                        tokenization: { bsonType: "bool" },
                        fraud_detection: { bsonType: "bool" },
                        mobile_optimized: { bsonType: "bool" }
                    }
                },
                active: { bsonType: "bool" },
                test_mode: { bsonType: "bool" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" }
            }
        }
    }
};

/**
 *  ESQUEMA DE TRANSACCIONES
 */
const TransactionSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["transaction_id", "order_id", "payment_method_id", "type", "amount", "currency", "status"],
            properties: {
                transaction_id: {
                    bsonType: "string",
                    pattern: "^TXN-[0-9]{8}-[A-Z0-9]{8}$",
                    description: "ID único de transacción"
                },
                external_transaction_id: {
                    bsonType: "string",
                    maxLength: 100,
                    description: "ID de transacción del procesador externo"
                },
                order_id: {
                    bsonType: "objectId",
                    description: "Referencia al pedido"
                },
                payment_method_id: {
                    bsonType: "objectId",
                    description: "Referencia al método de pago usado"
                },
                type: {
                    bsonType: "string",
                    enum: ["payment", "refund", "partial_refund", "chargeback", "fee", "adjustment"],
                    description: "Tipo de transacción"
                },
                amount: {
                    bsonType: "double",
                    minimum: 0,
                    description: "Monto de la transacción"
                },
                currency: {
                    bsonType: "string",
                    enum: ["GTQ", "USD", "EUR"],
                    description: "Moneda de la transacción"
                },
                status: {
                    bsonType: "string",
                    enum: ["pending", "processing", "completed", "failed", "cancelled", "disputed", "refunded"],
                    description: "Estado de la transacción"
                },
                payment_details: {
                    bsonType: "object",
                    properties: {
                        card_last_four: { bsonType: "string", pattern: "^[0-9]{4}$" },
                        card_type: { bsonType: "string", enum: ["visa", "mastercard", "amex", "discover"] },
                        bank_name: { bsonType: "string", maxLength: 100 },
                        account_type: { bsonType: "string", enum: ["checking", "savings", "credit"] },
                        authorization_code: { bsonType: "string", maxLength: 20 },
                        reference_number: { bsonType: "string", maxLength: 50 }
                    }
                },
                fees: {
                    bsonType: "object",
                    properties: {
                        processing_fee: { bsonType: "double", minimum: 0 },
                        fixed_fee: { bsonType: "double", minimum: 0 },
                        gateway_fee: { bsonType: "double", minimum: 0 },
                        total_fees: { bsonType: "double", minimum: 0 }
                    }
                },
                fraud_check: {
                    bsonType: "object",
                    properties: {
                        risk_score: { bsonType: "int", minimum: 0, maximum: 100 },
                        risk_level: { bsonType: "string", enum: ["low", "medium", "high", "critical"] },
                        flags: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        verified: { bsonType: "bool" },
                        verification_method: { bsonType: "string", maxLength: 50 }
                    }
                },
                processor_response: {
                    bsonType: "object",
                    properties: {
                        response_code: { bsonType: "string", maxLength: 10 },
                        response_message: { bsonType: "string", maxLength: 200 },
                        avs_response: { bsonType: "string", maxLength: 10 },
                        cvv_response: { bsonType: "string", maxLength: 10 },
                        transaction_reference: { bsonType: "string", maxLength: 100 }
                    }
                },
                processed_at: { bsonType: "date" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" }
            }
        }
    }
};

/**
 *  ESQUEMA DE NOTIFICACIONES
 */
const NotificationSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["notification_id", "recipient_id", "type", "channel", "title", "content", "status"],
            properties: {
                notification_id: {
                    bsonType: "string",
                    pattern: "^NOTIF-[0-9]{8}-[A-Z0-9]{8}$",
                    description: "ID único de notificación"
                },
                recipient_id: {
                    bsonType: "objectId",
                    description: "Usuario destinatario"
                },
                related_entity: {
                    bsonType: "object",
                    properties: {
                        entity_type: { bsonType: "string", enum: ["order", "shipment", "payment", "user", "system"] },
                        entity_id: { bsonType: "objectId" }
                    }
                },
                type: {
                    bsonType: "string",
                    enum: ["order_confirmation", "shipment_update", "delivery_confirmation", "payment_received", "payment_failed", "promotion", "system_alert", "reminder"],
                    description: "Tipo de notificación"
                },
                priority: {
                    bsonType: "string",
                    enum: ["low", "normal", "high", "urgent"],
                    description: "Prioridad de la notificación"
                },
                channel: {
                    bsonType: "string",
                    enum: ["email", "sms", "push", "in_app", "whatsapp"],
                    description: "Canal de entrega"
                },
                title: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 200,
                    description: "Título de la notificación"
                },
                content: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 2000,
                    description: "Contenido de la notificación"
                },
                template_id: {
                    bsonType: "string",
                    maxLength: 50,
                    description: "ID de plantilla usada"
                },
                variables: {
                    bsonType: "object",
                    description: "Variables para personalización"
                },
                delivery_config: {
                    bsonType: "object",
                    properties: {
                        schedule_for: { bsonType: "date" },
                        retry_count: { bsonType: "int", minimum: 0, maximum: 5 },
                        retry_interval: { bsonType: "int", minimum: 0 },
                        expire_at: { bsonType: "date" }
                    }
                },
                status: {
                    bsonType: "string",
                    enum: ["pending", "sent", "delivered", "failed", "expired", "cancelled"],
                    description: "Estado de la notificación"
                },
                delivery_attempts: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            attempt_number: { bsonType: "int", minimum: 1 },
                            attempted_at: { bsonType: "date" },
                            status: { bsonType: "string", enum: ["success", "failed", "bounced", "rejected"] },
                            response: { bsonType: "string", maxLength: 500 },
                            external_id: { bsonType: "string", maxLength: 100 }
                        }
                    }
                },
                read_status: {
                    bsonType: "object",
                    properties: {
                        is_read: { bsonType: "bool" },
                        read_at: { bsonType: "date" },
                        clicked: { bsonType: "bool" },
                        clicked_at: { bsonType: "date" }
                    }
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                sent_at: { bsonType: "date" },
                delivered_at: { bsonType: "date" }
            }
        }
    }
};

/**
 *  ESQUEMA DE LOGS DEL SISTEMA
 */
const SystemLogSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["log_id", "level", "source", "message", "timestamp"],
            properties: {
                log_id: {
                    bsonType: "string",
                    pattern: "^LOG-[0-9]{8}-[A-Z0-9]{8}$",
                    description: "ID único del log"
                },
                level: {
                    bsonType: "string",
                    enum: ["debug", "info", "warn", "error", "fatal"],
                    description: "Nivel de severidad"
                },
                source: {
                    bsonType: "string",
                    enum: ["api", "web", "mobile", "system", "cron", "webhook", "external"],
                    description: "Origen del evento"
                },
                category: {
                    bsonType: "string",
                    enum: ["authentication", "authorization", "order", "payment", "shipment", "notification", "system", "security", "performance"],
                    description: "Categoría del evento"
                },
                message: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 1000,
                    description: "Mensaje del log"
                },
                context: {
                    bsonType: "object",
                    properties: {
                        user_id: { bsonType: "objectId" },
                        session_id: { bsonType: "string", maxLength: 100 },
                        ip_address: { bsonType: "string", pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" },
                        user_agent: { bsonType: "string", maxLength: 500 },
                        request_id: { bsonType: "string", maxLength: 100 },
                        endpoint: { bsonType: "string", maxLength: 200 },
                        method: { bsonType: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] }
                    }
                },
                related_entities: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            entity_type: { bsonType: "string", maxLength: 50 },
                            entity_id: { bsonType: "string", maxLength: 100 }
                        }
                    }
                },
                error_details: {
                    bsonType: "object",
                    properties: {
                        error_code: { bsonType: "string", maxLength: 50 },
                        error_type: { bsonType: "string", maxLength: 100 },
                        stack_trace: { bsonType: "string", maxLength: 5000 },
                        file: { bsonType: "string", maxLength: 200 },
                        line: { bsonType: "int", minimum: 0 },
                        function: { bsonType: "string", maxLength: 100 }
                    }
                },
                performance: {
                    bsonType: "object",
                    properties: {
                        duration_ms: { bsonType: "double", minimum: 0 },
                        memory_usage: { bsonType: "long", minimum: 0 },
                        cpu_usage: { bsonType: "double", minimum: 0, maximum: 100 },
                        database_queries: { bsonType: "int", minimum: 0 },
                        external_calls: { bsonType: "int", minimum: 0 }
                    }
                },
                tags: {
                    bsonType: "array",
                    items: { bsonType: "string", maxLength: 50 }
                },
                timestamp: { bsonType: "date" },
                processed_at: { bsonType: "date" },
                archived: { bsonType: "bool" }
            }
        }
    }
};

module.exports = {
    PaymentMethodSchema,
    TransactionSchema,
    NotificationSchema,
    SystemLogSchema
};