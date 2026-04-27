import React from 'react';
import { Navigate } from 'react-router-dom';

/** Legacy route — catalog lives on `/shop` with the same filters. */
export default function Categories() {
  return <Navigate to="/shop" replace />;
}
