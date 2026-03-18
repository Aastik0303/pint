# GlowCare - Women's Beauty & Healthcare Products Website

## Problem Statement
Create a women's beauty and healthcare products website with admin panel (password protected) and public user panel (no login required).

## Architecture
- **Frontend**: React.js with Tailwind CSS, Framer Motion, React Router
- **Backend**: FastAPI (Python) with JWT authentication
- **Database**: MongoDB (products collection)
- **Storage**: Local file uploads for product images

## Core Features Implemented
- ✅ Public Homepage with hero section and product grid
- ✅ About page with company information
- ✅ Contact page (Phone: 7417845421, Email: aastikmishra20@gmail.com)
- ✅ Admin login with password authentication (admin123)
- ✅ Admin dashboard with product CRUD operations
- ✅ Product categories: Skincare, Haircare, Makeup, Healthcare
- ✅ Image upload for products
- ✅ Healthcare green color scheme (emerald/mint)

## API Endpoints
- GET /api/health - Health check
- GET /api/products - List products
- POST /api/admin/login - Admin login
- POST /api/admin/products - Create product
- PUT /api/admin/products/{id} - Update product
- DELETE /api/admin/products/{id} - Delete product

## User Personas
1. **Public Visitor**: Browse products, view details, contact info
2. **Admin**: Manage products (add/edit/delete)

## Date: March 18, 2026
