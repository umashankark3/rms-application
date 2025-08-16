const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const data = {
        body: req.body,
        query: req.query,
        params: req.params
      };

      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  login: z.object({
    body: z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required')
    })
  }),

  createUser: z.object({
    body: z.object({
      username: z.string().min(3).max(50),
      fullName: z.string().max(120).optional(),
      phone: z.string().max(20).optional(),
      role: z.enum(['admin', 'recruiter']).default('recruiter'),
      password: z.string().min(6)
    })
  }),

  updateUser: z.object({
    params: z.object({
      id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
      fullName: z.string().max(120).optional(),
      phone: z.string().max(20).optional(),
      role: z.enum(['admin', 'recruiter']).optional()
    })
  }),

  resumeQuery: z.object({
    query: z.object({
      q: z.string().optional(),
      status: z.union([
        z.enum(['new', 'reviewing', 'assigned', 'shortlisted', 'rejected']),
        z.literal('')
      ]).optional(),
      assignedTo: z.string().optional(),
      page: z.string().transform(val => parseInt(val) || 1).optional(),
      limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional()
    })
  }),

  updateResume: z.object({
    params: z.object({
      id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
      status: z.enum(['new', 'reviewing', 'assigned', 'shortlisted', 'rejected']).optional(),
      notes: z.string().optional()
    })
  }),

  assignResume: z.object({
    params: z.object({
      id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
      username: z.string().min(1)
    })
  }),

  createShareLink: z.object({
    params: z.object({
      id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
      expiresInMinutes: z.number().min(1).max(10080).optional() // Max 7 days
    })
  })
};

module.exports = {
  validate,
  schemas
};