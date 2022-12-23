import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" image={product.image}></CardMedia>
      <CardContent>
        <Typography>{product.name}</Typography>
        <Typography fontWeight={700}>${product.cost}</Typography>
        <Rating name="read-only" readOnly value={product.rating} />
        <CardActions className="card-actions">
          <Button variant="contained" className="button" onClick={(()=>handleAddToCart())} fullWidth>
            <AddShoppingCartOutlined />
            Add to cart
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
