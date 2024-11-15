import Joi, { ObjectSchema } from 'joi';

export const signinSchema: ObjectSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().email().messages({
      'string.base': 'Email must be of type string',
      'string.email': 'Invalid email',
      'string.empty': 'Email is required'
    }),
    otherwise: Joi.string().min(4).max(12).messages({
      'string.base': 'Username must be of type string',
      'string.min': 'Invalid username',
      'string.max': 'Invalid username',
      'string.empty': 'Username is required'
    })
  }),
  password: Joi.string().min(8).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.empty': 'Password is required'
  })
});
