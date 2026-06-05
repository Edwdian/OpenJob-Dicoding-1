const Joi = require('joi');

// Disable type coercion so number won't silently pass as string
const joi = Joi.defaults((schema) => schema.options({ convert: false }));

const registerSchema = joi.object({
  name: joi.string().max(100).required(),
  email: joi.string().email().max(100).required(),
  password: joi.string().min(6).required(),
  role: joi.string().valid('jobseeker', 'employer', 'user').optional(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required(),
});

const companySchema = joi.object({
  name: joi.string().max(150).required(),
  description: joi.string().required(),
  location: joi.string().max(150).required(),
  website: joi.string().max(255).allow('', null).optional(),
  industry: joi.string().max(100).allow('', null).optional(),
});

const categorySchema = joi.object({
  name: joi.string().min(1).max(100).required(),
  description: joi.string().allow('', null).optional(),
});

const jobSchema = joi.object({
  company_id: joi.string().required(),
  category_id: joi.string().required(),
  title: joi.string().max(200).required(),
  description: joi.string().allow('', null).optional(),
  requirements: joi.string().allow('', null).optional(),
  salary_min: joi.number().integer().allow(null).optional(),
  salary_max: joi.number().integer().allow(null).optional(),
  location: joi.string().max(150).allow('', null).optional(),
  type: joi.string().max(50).allow('', null).optional(),
  status: joi.string().valid('open', 'closed').optional(),
  job_type: joi.string().allow('', null).optional(),
  experience_level: joi.string().allow('', null).optional(),
  location_type: joi.string().allow('', null).optional(),
  location_city: joi.string().allow('', null).optional(),
  is_salary_visible: joi.boolean().optional(),
}).options({ allowUnknown: true, convert: false });

const applicationSchema = joi.object({
  job_id: joi.string().required(),
  user_id: joi.string().allow('', null).optional(),
  cover_letter: joi.string().allow('', null).optional(),
  status: joi.string().allow('', null).optional(),
});

const applicationStatusSchema = joi.object({
  status: joi.string().valid('pending', 'reviewed', 'accepted', 'rejected').required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  companySchema,
  categorySchema,
  jobSchema,
  applicationSchema,
  applicationStatusSchema,
};
