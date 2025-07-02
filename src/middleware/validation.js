import Joi from 'joi';

// Middleware de validação genérico
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Schemas de validação
export const schemas = {
  // Autenticação
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    phone: Joi.string().optional()
  }),

  // Lojas
  createStore: Joi.object({
    store_name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome da loja deve ter pelo menos 2 caracteres',
      'string.max': 'Nome da loja deve ter no máximo 255 caracteres',
      'any.required': 'Nome da loja é obrigatório'
    }),
    store_description: Joi.string().max(1000).optional(),
    whatsapp_number: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zip_code: Joi.string().optional()
  }),

  updateStore: Joi.object({
    store_name: Joi.string().min(2).max(255).optional(),
    store_description: Joi.string().max(1000).optional(),
    whatsapp_number: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zip_code: Joi.string().optional(),
    primary_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    secondary_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),

  // Produtos
  createProduct: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome do produto deve ter pelo menos 2 caracteres',
      'string.max': 'Nome do produto deve ter no máximo 255 caracteres',
      'any.required': 'Nome do produto é obrigatório'
    }),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Preço deve ser um valor positivo',
      'any.required': 'Preço é obrigatório'
    }),
    compare_price: Joi.number().positive().optional(),
    category_id: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da categoria deve ser um UUID válido',
      'any.required': 'Categoria é obrigatória'
    }),
    sku: Joi.string().max(100).optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    weight: Joi.number().positive().optional(),
    status: Joi.string().valid('active', 'inactive', 'draft').optional(),
    is_featured: Joi.boolean().optional()
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    price: Joi.number().positive().optional(),
    compare_price: Joi.number().positive().optional(),
    category_id: Joi.string().uuid().optional(),
    sku: Joi.string().max(100).optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    weight: Joi.number().positive().optional(),
    status: Joi.string().valid('active', 'inactive', 'draft').optional(),
    is_featured: Joi.boolean().optional()
  }),

  // Categorias
  createCategory: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome da categoria deve ter pelo menos 2 caracteres',
      'string.max': 'Nome da categoria deve ter no máximo 255 caracteres',
      'any.required': 'Nome da categoria é obrigatório'
    }),
    description: Joi.string().optional(),
    parent_id: Joi.string().uuid().optional()
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().optional(),
    parent_id: Joi.string().uuid().optional(),
    is_active: Joi.boolean().optional()
  }),

  // Pedidos
  createOrder: Joi.object({
    customer_name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome do cliente deve ter pelo menos 2 caracteres',
      'string.max': 'Nome do cliente deve ter no máximo 255 caracteres',
      'any.required': 'Nome do cliente é obrigatório'
    }),
    customer_phone: Joi.string().required().messages({
      'any.required': 'Telefone do cliente é obrigatório'
    }),
    customer_email: Joi.string().email().optional(),
    shipping_address: Joi.object({
      street: Joi.string().required(),
      number: Joi.string().required(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zip_code: Joi.string().required()
    }).required(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required().messages({
      'array.min': 'Pelo menos um item é obrigatório'
    })
  }),

  // Banners
  createBanner: Joi.object({
    title: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Título deve ter pelo menos 2 caracteres',
      'string.max': 'Título deve ter no máximo 255 caracteres',
      'any.required': 'Título é obrigatório'
    }),
    subtitle: Joi.string().optional(),
    link_url: Joi.string().uri().optional(),
    button_text: Joi.string().max(100).optional(),
    position: Joi.string().valid('hero', 'middle', 'footer', 'sidebar').optional()
  }),

  updateBanner: Joi.object({
    title: Joi.string().min(2).max(255).optional(),
    subtitle: Joi.string().optional(),
    link_url: Joi.string().uri().optional(),
    button_text: Joi.string().max(100).optional(),
    position: Joi.string().valid('hero', 'middle', 'footer', 'sidebar').optional(),
    is_active: Joi.boolean().optional()
  })
};