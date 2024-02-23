import swaggerJsdoc from 'swagger-jsdoc';

export const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version: '1.0.1',
      description: '',
    },
    servers: [ 
    {
      url: 'http://localhost:2023/api/v1', 
      description: 'Local server',
    },
    {
      url: 'https://theline.social/api/v1', 
      description: 'Production server',
    }
  ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      400: {
        description: 'Missing Credentials - Plese check the API documentation',
        contents: 'application/json',
      },
      401: {
        description: 'Unauthorized - incorrect API key or incorrect format',
        contents: 'application/json',
      },
      403: {
        description:
          'Permission Denied. You do not have the rights to access this request',
        contents: 'application/json',
      },
      404: {
        description: 'Not found - the request Data was not found',
        contents: 'application/json',
      },
      500: {
        description: 'A problem has occurred. Sorry for inconvenience',
        contents: 'application/json',
      },
      410: {
        description: 'The requested data is not available',
        contents: 'application/json',
      },
      408: {
        description: 'The request timed out. Please try again',
        contents: 'application/json',
        schema: { error: 'The request timed out. Please try again' },
      },
      409: {
        description: 'Conflict Occured. Check again ',
        contents: 'application/json',
        schema: { error: 'Conflict Occured. Check again' },
      },
    },
  },
  apis: ['./src/routes/*.router.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
