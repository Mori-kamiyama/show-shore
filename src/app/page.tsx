'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { CSVLink } from 'react-csv';
import { Button, Select, MenuItem, Card, CardContent, CardHeader, Typography, CircularProgress } from '@mui/material';
import '@fontsource/roboto';  // Importing a cleaner font

interface Shop {
  id: number;
  name: string;
}

interface Product {
  id: number;
  shop_id: number;
  name: string;
  amount: number;
  price: string;
}

export default function SalesCalculator() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('https://cash.toromino.net/api/shops');
        if (!response.ok) {
          throw new Error('Failed to fetch shop list');
        }
        const data: Shop[] = await response.json();
        setShops(data);
      } catch (err) {
        setError(`Error fetching shop list: ${(err as Error).message}`);
      }
    };

    fetchShops();
  }, []);

  const fetchAndCalculateSales = async () => {
    if (selectedShopId === null) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://cash.toromino.net/api/shops/${selectedShopId}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const products: Product[] = await response.json();

      let total = 0;
      const sales = products.map((product) => {
        const productSales = product.amount * parseFloat(product.price);
        total += productSales;
        return {
          productName: product.name,
          sales: productSales,
        };
      });

      setProducts(products);
      setTotalSales(total);
    } catch (err) {
      setError(`Error fetching or processing data. Please try again. Details: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const csvData = [
    ['ID', '商品名', '単価 (JPY)', '数量', '売り上げ (JPY)'],
    ...products.map((product) => [
      product.id,
      product.name,
      parseFloat(product.price).toFixed(2),
      product.amount,
      (product.amount * parseFloat(product.price)).toFixed(2),
    ]),
    ['トータル', '', '', '', totalSales.toFixed(2)],
  ];

  return (
      <Card
          style={{
              maxWidth: '450px',
              margin: '0 auto',
              marginTop: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Montserrat, sans-serif', // Use a more stylish font
              padding: '20px',
          }}
      >
          <CardHeader
              title={
                  <Typography
                      variant="h4" // Make the font size larger
                      style={{
                          fontWeight: 700, // Keep it bold
                          fontSize: '28px', // Larger font size
                          textAlign: 'left', // Align the text to the left
                          fontFamily: 'Montserrat, sans-serif', // Apply a modern stylish font
                      }}
                  >
                      Sales Calculator
                  </Typography>
              }
          />
          <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Shop selection and Button side by side */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <Select
                          value={selectedShopId || ''}
                          onChange={(e: ChangeEvent<{ value: unknown }>) =>
                              setSelectedShopId(e.target.value as number)
                          }
                          displayEmpty
                          style={{
                              flex: 1,
                              height: '48px', // Set height to match the button
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                              padding: '10px',
                              color: '#333',
                              fontSize: '16px',
                              border: '1px solid #ddd',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Add slight shadow to input
                              transition: 'box-shadow 0.3s ease',
                          }}
                          onMouseOver={(e) =>
                              (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)')
                          }
                          onMouseOut={(e) =>
                              (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)')
                          }
                      >
                          <MenuItem value="" disabled>
                              Select Shop
                          </MenuItem>
                          {shops.map((shop) => (
                              <MenuItem key={shop.id} value={shop.id}>
                                  {shop.name}
                              </MenuItem>
                          ))}
                      </Select>

                      <Button
                          variant="contained"
                          onClick={fetchAndCalculateSales}
                          disabled={isLoading || selectedShopId === null}
                          style={{
                              backgroundColor: isLoading || selectedShopId === null ? '#ccc' : '#000',
                              color: '#fff',
                              height: '48px', // Set height to match the select box
                              padding: '0 24px', // Adjust padding to fit the height
                              fontSize: '16px',
                              borderRadius: '8px',
                              minWidth: '120px',
                              transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                  isLoading || selectedShopId === null ? '#ccc' : '#222')
                          }
                          onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                  isLoading || selectedShopId === null ? '#ccc' : '#000')
                          }
                      >
                          {isLoading ? (
                              <CircularProgress size={24} style={{ color: '#fff' }} />
                          ) : (
                              'Calculate'
                          )}
                      </Button>
                  </div>

                  {error && (
                      <Typography color="error" style={{ marginTop: '8px' }}>
                          {error}
                      </Typography>
                  )}

                  {products.length > 0 && (
                      <div>
                          <Typography style={{ fontSize: '18px', fontWeight: 500 }}>
                              Total Sales: ¥{totalSales.toFixed(2)}
                          </Typography>
                          <CSVLink
                              data={csvData}
                              filename={`sales_report_shop_${selectedShopId}.csv`}
                              style={{ textDecoration: 'none' }}
                          >
                              <Button
                                  variant="outlined"
                                  style={{
                                      color: '#000',
                                      border: '1px solid #000',
                                      padding: '10px',
                                      fontSize: '16px',
                                      borderRadius: '8px',
                                      width: '100%',
                                      transition: 'background-color 0.3s ease',
                                  }}
                                  onMouseOver={(e) =>
                                      (e.currentTarget.style.backgroundColor = '#f4f4f4')
                                  }
                                  onMouseOut={(e) =>
                                      (e.currentTarget.style.backgroundColor = '#fff')
                                  }
                              >
                                  Download CSV
                              </Button>
                          </CSVLink>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
  );
}