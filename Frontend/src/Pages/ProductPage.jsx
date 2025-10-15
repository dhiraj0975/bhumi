// // // import React, { useState } from "react";
// // // import ProductTable from "../components/Product/ProductTable";
// // // import AddProductForm from "../components/Product/AddProductForm";
// // // import EditProduct from "../components/Product/EditProduct";
// // // import ProductSearchBar from "../components/Product/ProductSearchBar";

// // // const initialProducts = [
// // //   {
// // //     id: 1,
// // //     name: "Apple iPhone 15",
// // //     image: "/images/iphone.png",
// // //     price: 80000,
// // //     description: "Latest iPhone 15 with A17 Bionic chip and improved camera.",
// // //     createdAt: "6/15/2025, 4:10:00 PM",
// // //   },
// // //   {
// // //     id: 2,
// // //     name: "Nike Running Shoes",
// // //     image: "/images/shoes.png",
// // //     price: 5500,
// // //     description: "Comfortable Nike running shoes for all terrains.",
// // //     createdAt: "6/15/2025, 4:15:00 PM",
// // //   },
// // //   {
// // //     id: 3,
// // //     name: "Samsung Smart TV",
// // //     image: "/images/tv.png",
// // //     price: 45000,
// // //     description: "4K UHD Smart TV with HDR and voice assistant support.",
// // //     createdAt: "6/15/2025, 4:20:00 PM",
// // //   },
// // // ];

// // // const ProductPage = () => {
// // //   const [products, setProducts] = useState(initialProducts);
// // //   const [search, setSearch] = useState("");
// // //   const [showForm, setShowForm] = useState(false);
// // //   const [editingProduct, setEditingProduct] = useState(null);

// // //   // Add Product
// // //   const handleAddProduct = (newProduct) => {
// // //     setProducts([...products, { ...newProduct, id: products.length + 1 }]);
// // //     setShowForm(false);
// // //   };

// // //   // Update Product
// // //   const handleUpdateProduct = (updatedProduct) => {
// // //     setProducts(
// // //       products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
// // //     );
// // //     setEditingProduct(null);
// // //     setShowForm(false);
// // //   };

// // //   // Delete Product
// // //   const handleDelete = (id) => {
// // //     setProducts(products.filter((p) => p.id !== id));
// // //   };

// // //   // Edit Product
// // //   const handleEdit = (id) => {
// // //     const productToEdit = products.find((p) => p.id === id);
// // //     setEditingProduct(productToEdit);
// // //     setShowForm(true);
// // //   };

// // //   const filteredProducts = products.filter((p) =>
// // //     p.name.toLowerCase().includes(search.toLowerCase())
// // //   );

// // //   return (
// // //     <div className="min-h-screen p-4 bg-gray-50">
// // //       <div className="max-w-7xl">
// // //         <div className="space-y-4">
// // //           <div className="flex justify-between items-center">
// // //             <h1 className="text-2xl font-bold">Product Manager</h1>
// // //             <div className="flex items-center gap-2">
// // //               <ProductSearchBar search={search} setSearch={setSearch} />
// // //               <button
// // //                 onClick={() => {
// // //                   setShowForm(!showForm);
// // //                   setEditingProduct(null);
// // //                 }}
// // //                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 drop-shadow-lg transform hover:scale-103"
// // //               >
// // //                 {showForm ? "Close Form" : "Add Product"}
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Show either Add or Edit form */}
// // //           {showForm ? (
// // //             editingProduct ? (
// // //               <EditProduct
// // //                 onUpdate={handleUpdateProduct}
// // //                 editingProduct={editingProduct}
// // //               />
// // //             ) : (
// // //               <AddProductForm onAdd={handleAddProduct} />
// // //             )
// // //           ) : (
// // //             <ProductTable
// // //               products={filteredProducts}
// // //               onDelete={handleDelete}
// // //               onEdit={handleEdit}
// // //             />
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ProductPage;

// import React, { useState } from "react";
// import ProductTable from "../components/Product/ProductTable";
// import AddProductForm from "../components/Product/AddProductForm";
// import EditProduct from "../components/Product/EditProduct";
// import ProductSearchBar from "../components/Product/ProductSearchBar";

// const initialProducts = [
//   {
//     id: 1,
//     name: "Sharbati wheat",
//     image:
//       "https://5.imimg.com/data5/KD/GH/MY-2991473/organic-basmati-rice-500x500.jpg",
//     price: 300,
//     description:
//       "Premium long-grain organic Basmati rice, grown without synthetic fertilizers or pesticides, aromatic and fluffy.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 2,
//     name: "Sona moti wheat",
//     image:
//       "https://media.istockphoto.com/id/1006196472/photo/bunch-of-spinach-leaves-on-isolated-white-background.jpg?s=612x612&w=0&k=20&c=OAIswtUC1aMNDwtMEFIaZv6fSIftsoAV-cgJZSGLJ7A=",
//     price: 50,
//     description:
//       "Fresh organic spinach leaves, rich in iron and vitamins, grown sustainably in nutrient-rich soil.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 3,
//     name: "Khapli wheat",
//     image:
//       "https://5.imimg.com/data5/SELLER/Default/2024/9/451515081/CC/FE/XL/151381977/shudh-desi-ghee-500x500.jpeg",
//     price: 800,
//     description:
//       "Pure organic desi ghee made from grass-fed cow milk, hand-churned for authentic flavor.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 4,
//     name: "Black wheat",
//     image:
//       "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUQEhMWFRUVFxUVFRcXFhcVFxUXFRUWFhUXFxUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tKy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYBB//EAD4QAAEDAgQDBQUFCAICAwAAAAEAAhEDBAUhMUESUWEGInGBkRMyobHRFEJSweEHFSNicoKS8DOiU/EWssL/xAAaAQACAwEBAAAAAAAAAAAAAAABAgADBAUG/8QAMBEAAgIBBAEDAQYGAwAAAAAAAAECAxEEEiExQRMiUWEFMnGBkbFiocHR4fAUFUL/2gAMAwEAAhEDEQA/AM0wKQxBYFIptWBm0KwI7QhsCM0JGMhwCK1NaERoShHtTlwBOAQCIJ7U0BOAUIPCeE1oTwFCHQlKSUKEEkugJQoQauQnwlChBkLhCfC4QoQE5MKtrbBK1TPh4Rzdl8FKPZuB3qnoEkroR7ZMGcKaVcVcIEw1x8wq+6tHMOY80Y2wl0wuLRDKY5FIQ3BWABOQnIzghOCIADwguUhwQnBEhHchOUhwQXBMhSO8ILgpLgguCZAYCF1PhcTClsxqkMah0wjsCqY6CMCKAmNCK0JGMjrQjNCY1qIAgEcF1IBOAQCKE4BIBOAQIOaE+FwBGpW73e60nyUIDhdhT6WD1TtHijtwN/MJdyIVMJQrStgzxpmo7rB4+6pvRCHCSIWGYjNX2FdnSYfWyGoZuf6uXgpKaissj4KvDcJqVjIybu46eXNaWzwulRExxO/Ecz5clNqVQ0Q0QBoAolV0rn26pzeIhUc9nLi5JyCixOqe9yC58KjhcssX0E8BRLyiHtIKHe4i1nUqqr4mTulU+faHHyVtxS4SWoJUivU4sygkLt1ycopspaAuCE8KQ4ILwnIR3oTlIcEFwTCgHITgjuCE4JkAA4ITgpDgguCYVgYSToSRAW7ApDAgsCOxVMdBWBGaEJqM1KEe0IgCY1ECGAnQE8BcCtsLwZ9XP3Wczv4JW0llhK1jJyAnwVrZYG92b+6Pir+2tKdLusbJ3cVKY1Yp6tN4iHaRLXCKTPuyeZzU5tMDQAJEwuCokc2+2DA8MXQxN9sAmG45JXbFB2sNwBMNGcoT6bXHaEavU9k2Y4icvX5BHcmtz4Qr44BUbBjDxkDi58vBMrXE6Ide5LvBQzX1Efqsdl/qcLoeMPLDvcotSouPqKDeXzaYzOaTekizAe4rgCSVRX2MbNVbiGJl56KlubsDUplGUxsJFhc3sqKK5VX9snRWGHs4s1phQ1wgNlkzRIhPhNK60VhYKWDchOCM5CcnwAC5BejPQXJgAnBCcEZyE5MhQDkJyM9BciKCXUl1MAuGBHYFxrUZtNJtIpITQitSFEpwpFLsG3oe1EaF2nRK1uB4IKTRWrCXfdby/VV2SVcd0gqWeEAwfAg0CrX01Dfqrh1xOQEDYINeqXmT6ckgYXDv1Dt/AvjDHYZdFVRqj8s1BrXXLRZHcoFihks6twgGqolq19Qw0TzOw8SrenaikOIy52kwTmeQCMJWXddAe2I23tXOzPdHXVWFKi1uio766uBnTplx0hxbTYBznNx9FYULgu4Rudd/FaU41fVlclKRYGqGt4j5Krr3BcZKZiFYuMAwARw5TkI1z11UV7oWLUav1Xjwv5/X+w1deOfI+rWUSvchoLnTA5AuPoMyuuduqnEr/ZqohY5Mt2hcQxUNGSzV3elx1UTFcTZT950uOjRmT5KpoNr3BgAhvL6ldOnTcbpfqwOSXCJlxdDMA5qorW9QmcytlhXZM5F60FHA2N2WmNmz7qEfPZ5jh1k97oggLXW1EMhitMYw0NpufTADgJWdwi5rF8+yqOHMMcR6wtUbU4Zj2V4aZpKVkwjMp7sFnQo9CmXjNjm+II+al0qLxtkq43zDhFBc4TUbtKralBw1C3Qad0C4s2uGYV8dRjsVowz6JQH0zyWruLGFDfahbItSWUVuWDNvYeSC4LRPswo1SyTAyULggvCu6lj0UWpZooGSqhJTjZpJsgJ1F6uLUCM1UUy1S6FbaUWilMtu6lwhV9Wrlqrfsthvt3cTv+NnvHmeSrk1FZYxd4DhoA9vUGX3Rz6qdXrF5k6bBOu6/FkMmjQKK+pC81q9U7p/wo2VV7VnyOe6EJ1SBJQX1d1ArXJcYGZOgG6wTsb4iaIxDXV2j4ZhT63edLWc93eH1U/CcBAipXzOoZsP6uZ6K6q1gFpp0iit9v6Fc7v/ADAbRospN4WiAEGpdclHq3EqM6ons1GViPCFjX5Z2+uO6QNYQbHusknMiB0G58/91UDFLgNaTusdhnbMMqChVIHE9wD9Bw7Az97ZY/QtuUnDwWSkopI3z6iC926rLzFWUmmo9wDQJWJvO11zd1PYWdI56buI5nZo8VXp9Dbd10vL6C5xj2avGcXYwGXAAdVlnX1a5PDbMMaGoRl/aN1e4R+ztz4q3tQvfqGA91v1WlwPAPZEyXcP3WuDZEHWWrpV11VL2e5/Pj/P5g35+hk8F7DZ8dUlzjqStpZ4RTpDIBWwpxoo91UIGQk/JPO3zLlirnhFRXxqlTdwvIptnhDnnhBdyE6+KnUwHwQ4OB0LSCF5t+069LazOF8uFMHgAzaS85j+qB/gFP7H4n/CjjktOY0OYDjI8SVbdVKGmVy8iKac3E9Fo2zRnE+OZRstFmqOJO2KN+8H81zlqsdotdZc1GKI/JU1TGXg5on71B1WhalY6YNjLI1UF7lBN81CfiLRqj/ykTYSq2eSqK4IJCkPxNqjuuOPNdHQXuU9vgpujxkCSVwBOJSFSF1mjMhOpqDXYFKuLqAs7eYiZRjDIHIsOBJVYxNJHYybkOFpUJyRadlVndXtG7ZyUoXTeSfJUVNthVV5DRqTA816Iym23pNoN2HePM7qu7PvDi6pGTB8Tou4i0u3IJMyFw/tbU4xUvzNOnhl5H17sDOUBlaRMqK2gJk5+OaiG8NV/sqQJJPCBuT9Oq4G1zftNy4Jb3uqPFOmC5x0A/3ILUYVhDbccTodVOp2b0b9U/CMLbbMzg1He+78h0+abd3S3Rrjp1z979imU3Zwug9e6VdWrzqhPqoL3LLda+2WQikFL0KpVQXVpVdiWJtpiN1n3Sm8RLcEDtTXPAWtME78h0XnNy0RnnMnPqrvtBiJeCJ1+SsOyfYareEVKs06I/ycOQ5Lv6Gp1V5ZmumimwHBLrEnik1x9myOOo73GDr+J0bfLVezdnezNvZU/Z0W5/fefeeeZP5aBWWHWFK3pto0WBjG6Ab8yTueqI96F9qksePgpWWNITSUi5Q7m7jILHOxJFsYtjrm4DVU3F7PRBv7g81Q4hewHZxrny8JWVylOWEaYxSRH7U4Uy4IqAAVGwJMw5ozg9eR8tCoWE2VMZMEOGTswXTvJHkleYi4/wAOmC5/y6nkm4Rhfsu+7vPknoCcyte6ap2zl+C/3wJtW7KRfUmlu67VrquqYnwHvjLmNf1Ueretf7jwem/pqsypk3ljZC3leUAV41KhV3nmgOetcaVgRssxiDZDeLMmI+P5FEqVAd1TW1mGuLxMuzPoBPwHoj1qvCJJA8Si6o59pE35JXHLoC1FDDx7MDeJ81msDpmo4OAyG/PwWwpaKyubrlwCSTRQ3QLDBCjl4WgvbcPaQs/UtIXb0+oVq57MVlbiwFd4hU91QnZXYtxuumi1aU8FZlTZHkktMWNSR3sGEFpWIU1tiAJUe3epRrkZJGyYLuxAZSDR94lx8sghX10AJJyQ6dwCxvgfmVBu6wMzpuvH61uepnn5/Y6FKSihlziIa2Zy2Wp7G4WKdP7TUEPqCWz9xh08zr6LzvA6Ar3VOi0F7OIucP5W5kE7A5DzXrWI3IazOPyyWymqNEXNiWycvagOI3cbqiqVy4yUGrdF5k6bIb665t1znLJfCO1YJJqwhGtKiGrKqMTxYNkNPifoq41SseB8pE/E8UDBAKxuI35e7hbLnHQBAuLt1V3AzXc7Acytp2I7OU3S45tbHtH7uOzG8l3NLoo1R3zM1l3hDOxHYr2hFxcZgHynk3n1Pp09Oa0NaGtADRkAEMVAAABwgCABoBshuqSlv1UX10VKDfY5z5Q3uhNdU3Kr7m5nIaLm3ahL8S+FeQT7x8kHIbKPWqQm1q4CZbWFSsZA4W8z+QWaDlJ8cmhpIgXT5VN+47iu9zqh9lRMcLT75gmTG05ZHkvQrTB2Mz1PM6/opXsGjOFtqqnBZ8lUrU+jH2HZ1jB3R5nU9eqfXwwzwg5xOh0010Wre1AqAIOrLy2RTPO8WwqoJMSsXidq4HMQvZroArM4phIfMgLVRbKt/KJJJnk9evWb7tR4/uMeir6uN3IP/M74fRbXGMFDQSgdlexDLpwr1arXUgZ4Kbg5zuj3A93w18F2K9TQoOc1wvoZZwlnCZFwHCb29AcK1RtPd0xxf0/Vb7COxVGnBfNR3N5Lj8VrbS2Yxoaxoa0AAACAANoUrgC49mrna+OI/C/qXxgo/VlXSsQ3IAAJ7qSmVXgKvr3KROMRuWce2FVYm0BpdyUqtdAalVN7dioCwb6laNLY/UW0Sxe15Kt96EB98pX2EBMdaBekMBEN4eSSlig1JTJMB7cuEKexs5lRqFY7DopNMvPIKh5GWCuu8ZbbPcyo6AeH2fUEZ/GVDxLEpZ3SM/kpmP8AZwXYAc4Ag5HcSqel+z+o0f8ANLRtKwy0Fcp788+S1XNcGv8A2R2givc8yKTfIcb/AJs9Fador1zqoZ9wHM9c49IHqm4DUp2dkxrDMyfFxPe+nkqevfcUuOUzK5OrscpuCLau8jxdk/kmVroNEuMAKuuL5rRxE/qs1imLF5z93ZJTpHY+uC12YLO97TNeTTYdNeqqH1H1jDchudh+qqqlaTIHnzR2XzsgIaOQXco0UYcpGadzZosNtJLaNMS57g0c3EmBK9dtLRtvSZQZoz3j+Nx95x81hP2V4Y5znXtX3Wyyl1ccnu8hkPF3Jb+rT78grmfauozL0ovhdj0x8se0ncptasAo95c8AMQXRlP5qoq3e5K4cm0sI1Rjnkn3F0T4KKXlxDWiSdAorapcQ0Zk5ALW4PhgpNk5vOp5dAn0+lldLH6hssVaImHYGB36uZ5bD6lW/CBou1T1UStXXWxXQsJGPMrHlhX1FHqVVGfdqNUryk3uRaoYJFS4UOtXUapWPEANM5XKrlOPI5w1ZQbk5IL6oElUuLY8GtIbrnJ2CRNyeEFmT/aJeFvBTByJJcOYAOR6dOizvZfFKtOsHNqcA0dO7eUfI/qoPaTFjVqGDMHM6oGG4m1rhxtEcw2fNejp07jptjWcowSsTszk9qte1TYA3InVSHdpBsvOcPxSi8jhe2eWjvQq1FcLgWaGMH00bY2ZRoq+PuOih1MYduVVGoECpWA1MJoaaPWAuZYVrslS7aiSOImFRWjjWMMB4dz9FqaFqQ2IXY0umVfPky2TzwNZQ6pxtQpDKfKEnDac1tyUkU2qSNwjmV1QhWspBroNSY5EZ+inULdp/FziSgC6h2rBOwLpyHIKYx73ugO4dDkJ8Nd0rEJFCzYDPCecknXzK5Wq8Ak8IyOfX0RqlMUml0VKpLZAHyHVMcaT+EVWBs5cJJLgOZA9J5qt5Y3CPNbvEri3J/ie2HeDTykyJG3lz2Vae1NV4ILQ3YmZ9BuVs8Sw6g8nJzWjoeXprKyv7jpPd3QCYJgvaIAEkl0wI8VYtLXL3OPIvrNcZKh2IvOUk9XHNNaXuOclXpwMU4dwktIni0nkQDnGRUxmG8B0PdAkRBaXAQCOeauVUV0K7GU1vYuOZlXuB4B7Wo0HJgzc7LJo1jqdApQYMm97gIJBB5ZuyPKNpVbiNwWP7tTKe8w6Oj3SSI05ITi8NLsMZc8ns+G8LabWMAYxo4WtG0c+qdc4m1uQMu+S8ssO3TwadFgDmzwvcSZneCfXc5qyr4lALiYG5J/Mrx+p0FsLXu8nSrnGSyaO8vpMyoDq85rM1u1VBoycXnoMvXRRcJx37Tc06b+5SmX9QNvPIKyr7Osa6C74o9c7KWYDRWdmT7g5Dn5rRVbgASSsQceptflUAiBA5DQQjVMYFXJpUm5aeOEhNvqPLLOtixeeEZdVCq3NWS0iW/iBz9E2m0J76qwKbfMmX4S6H8aG6ogVKwUKviDW5Sr42Z6BgsC9Q7y+awZmTyCqrrFToMuqz2KYyymOJ7vAalx6DdaaaZ2MWUkixv8AETmSYHJee9osdNQllM5aF35D6o9w+4vDABZT5bkfzfRWeG9ldBGomYkeq7un0ka/dLsx2WuXCMF7NL2a9Ld2Pkw4HxyATWdjmZEx1zW71Cnaea+zU2hfVmiBUdHjPzW+d2OpxILdNDOR9M1Io9k6IiC3PIjUgxOWWe/ohKSl2RRaMNRxG5dkHf8AUSrTDsJdUIdUc9/TZbihhFFsCIy5dJy6KZ9kaIABnTLLrmAMlXiK6SH58lfhsUwGtYfNWZrvO0LjaZyHAIjKT13PPopIY7KAMhBgHKIyKiIRXGpz9EPhJ94mImVPfTcfvH0Gnrkmvo8/n+iOAZI4tm/j+CSeLMdD/ckoQqKdzmSOASTOX1y15K2biAaJE7CI4Rrn4LP2lF0ggDIyZGqsqTahgBkAGY58pRaiVrJLfidQyJ4Q4QMjsAYExJ6wo7a3CWkh3vS7XveQU+xtDkTkTxHTITl6qU/CWOzMkz+I7cuSG5IO1sz96/LhdIkHWJyJ1G22qo/Yz95pHLeJzjZehjs/TdIjrlH55JrcCpNB/hTrkOGcx1KZWius87tLl1OqGuIe3MwXADLfr4TmYR3VgCGth4zPUP3iNMtlsXG0YWl9J0OkH2jOfIxnn81YWTbJ44msYIlpg8JB5c5Tep9AbDzC5fVeG0WtIIJM5w3unM5dSq+8w0tEySdJI96JlzRy2iJyXs1WxsHuBeAXuB4XF0uI0ID5nYBRq/Z6k9/FIkAgEnj7p5gwT5yp6iJtZ4nUoVQRwU+suy8xMKRVtLquJLg6BPC2XRnEkAL1+z7K02QXND3gnvZ8MTl/DMiY8lZU8LAbwCGt24RHySylDOcDRUjxW37J3DgHFr46jhEf3K0ssENuRVLmjhz94OM7CBkvTLjCKYnM59J36rMYzQpQR3tDGmR5wq3Yh1FmPp4qBUNRxEjX+ZbXAcXoOEtyO68+rWR70tg/PwT7F7aAzcc1j1+lhfHjv6FlM3Hs9ZZijSNQg1cTbsZXnA7S0wIBd/iU9vaScmMefJcf/qp/DNfrRNndXxdvAVXdXrWAkkDmSqIXF3WyZT4Rzd9ApVt2LqVTxXFRzt4Ay8gt1H2dj7zwVyv+CtvO0D6h4LcT/MdPIbo+GdnXOPtazuIncn4LZWHZajTGTCfEgfkrRmD09eATnnJP5rqwrhBYiZ3Jvsp7SwpUwBLfUDnIPLzU1jxoOpJaCS6Nv/fxVgLCmPusBHQZHnmjNDQILvQfTJEGSrosqacJ0I73dGehG8jl1R/s73ExwjLZvFGXN3n6qY4tGjZjyld9u/aAoAiU8Of+JwEARkMhoN+Q9E9uGSQS90jfJEeXHPj9NPgotdzW58RzmZIHzUyEkCxb95ziR1AjwXRQpt+71ku+eqqa+KUBrWbH9Y9IUYYvRGjyR0D3ZeQU/Iho3kfyjf8AXVR33Lfxf/UGFRuxemPuvJ6Unzl4hMdijp7tGoZ3hjPg5wKbD+BeC3dct1759fiMkF120at8JMfnoqWpe13a06bR/M8u/wCoET1lDfRrkHiqBv8ARTAj/IuzyTbWDci5N438A/ySVD7Cr/56h6zSE/8AVJTa/kmUWdGo4DbPeVZW1Vw5LO0nKwpPKRxIpGgY85S4Ln2trRJcNfFVNJ5ykpz2jNDaFyL6nizAdzO6f+9KZOuvNZ1lRstG8IGIXDRkjsF3mvmnUAhwMGUE4Y3QQASXQMszvksjSuiB3PFEZ2ge0jiGSnpsm9Gpt8GDTltp59VPbYtiHAGYnn4gjNY7/wCUPnQwplDGKjukjcqbGibkbNg65JlSAqG3xPZxzGqk/vEbIMKZLurbiCrbnBmvGcD/AHopdO/BEIVa9ETvyQ2ph3FDV7JU51MeQUW47Fs0jzWhpXRdtC7Sql2RcBCO0XcZqj2NojUQrS2wC3ZGU+StHvpgd56Yy7pxLWPd4NKm0O47StaY91iNwTG35qO65fsyPEwuuFQnVrR0BP0UwHIVzdkJ0DcDxXRQbP8AEe4nxgegQr9lvwGacgiNyfijgmQFfEKLRJqsH9w/JQrjtDbAEirMa8ILo8eSommjBaWAOaSNAJGxVfWpDjmeGcg4f/obhOoIVyZpqXaZlQfwqdR+ugDRlrqnOurl33abAdC4lx9B9VW9iLEh1VryM+XTQrRVbYjLb/cwhJRi8EWWU77eo8S+u/wb3Gnl1+Ka3DqQMPbxZau7zh4F2oUmrSc0wTkkWTvPgimBkOr7NmbWgaDIAeOiVG7aSdPA/NG9iJMNmeaYbCTLWgJgZBuqMdOmaTag1cZE6xJ5ckZtrsRC6aGUSiTIB1VhmJMzpltvzUEvMd1ojPV30U9tkGzBySdbNOShCg7/AOIDpISVs6wbyXVMohWMa6ZlWdAEBJJI2RIm0mmUapbk6mFxJV7mHAOnh4meIp15QY33s5SSRTbYGBoGmNJUe7uGA8IbkuJK1ITIOteACOFFt6zncJb4FcSTpLArZPFKoXAgfFWFLD6juQC6kkCTG4PU/wDJAXaeEgZ8RJ32XUkr4CmIWjAcwT5lSBZ0x90Z9EkkuRsCIaNAB5Ln2oNMEpJJUwhHVWRxRmolbExGTUkkUQramJugnJU1/jNQnhlJJPGKBllFdkud1V9gOHtqt4X7JJJ5LgCZoLTABSd7Smc9D1CsLhuUfFJJUNlqIv2EFEZh4GySSKAxzrQITqIakkiKCqUwQodZkZpJI5IiM6oNFHq1wIhJJMEY2/KSSSgD/9k=",
//     price: 200,
//     description:
//       "Crisp and juicy organic apples from Himalayan orchards, naturally grown without chemicals.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 5,
//     name: "Mill wheat",
//     image:
//       "https://dhanipurespices.com/wp-content/uploads/2022/10/Turmeric-Powder-and-Whole.jpeg",
//     price: 150,
//     description:
//       "High-curcumin organic turmeric powder, grown in organic farms, perfect for cooking and health benefits.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 6,
//     name: "Bansi wheat",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s",
//       price: 250,
//     description:
//       "Plump and flavorful organic tomatoes, grown using natural compost and free from pesticides.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 7,
//     name: "Sharbati Flour",
//     image:
//     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZNPc6pR1ix0GGtufAtIGE71-Q8ov1EZ67og&s",
//     price: 250,
//     description:
//       "Organic moong dal, rich in protein, grown sustainably without chemical fertilizers.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 8,
//     name: "Khapli flour",
//     image:
//       "https://c.ndtvimg.com/2021-07/7s38qeug_honey_625x300_05_July_21.jpg",
//     price: 400,
//     description:
//       "Pure organic honey harvested from natural beehives, free from additives and preservatives.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 9,
//     name: "Bansi flour",
//     image:
//       "https://cdn.shopify.com/s/files/1/0058/7779/2832/files/Carrot_Extract.png?v=1653976604",
//     price: 70,
//     description:
//       "Sweet and crunchy organic carrots, grown in fertile organic soil, rich in beta-carotene.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },
//   {
//     id: 10,
//     name: "Sonamoti",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMJzDJjA_dYfxilOJ2v-IFSw3EIQmWkZWYAg&s",
//     price: 350,
//     description:
//       "Creamy organic almond milk, made from organic almonds, free from synthetic additives.",
//     createdAt: "8/30/2025, 11:00:00 AM",
//   },

//   {
//     id: 11,
//     name: "Mangoes",
//     image:
//       "https://media.istockphoto.com/id/1019835828/photo/mango-and-leaf-isolated-white-background.jpg?s=612x612&w=0&k=20&c=_nmOBzO9mGEitT2rUvO1xAX9jwL5mHYI8AFRbYeyy-A=",
//     price: 1200,
//     description:
//       "Fresh farm-grown organic Alphonso mangoes, naturally ripened.",
//     createdAt: "6/16/2025, 9:30:00 AM",
//   },
// ];

// const ProductPage = () => {
//   const [products, setProducts] = useState(initialProducts);
//   const [search, setSearch] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);

//   // Add Product
//   const handleAddProduct = (newProduct) => {
//     setProducts([...products, { ...newProduct, id: products.length + 1 }]);
//     setShowForm(false);
//   };

//   // Update Product
//   const handleUpdateProduct = (updatedProduct) => {
//     setProducts(
//       products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
//     );
//     setEditingProduct(null);
//     setShowForm(false);
//   };

//   // Delete Product
//   const handleDelete = (id) => {
//     setProducts(products.filter((p) => p.id !== id));
//   };

//   // Edit Product
//   const handleEdit = (id) => {
//     const productToEdit = products.find((p) => p.id === id);
//     setEditingProduct(productToEdit);
//     setShowForm(true);
//   };

//   const filteredProducts = products.filter((p) =>
//     p.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
//       <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b">
//           <h1 className="text-3xl font-extrabold text-gray-800">
//             📦 Product Manager
//           </h1>

//           <div className="flex flex-col sm:flex-row items-center gap-3">
//             <ProductSearchBar search={search} setSearch={setSearch} />
//             <button
//               onClick={() => {
//                 setShowForm(!showForm);
//                 setEditingProduct(null);
//               }}
//               className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
//             >
//               {showForm ? "Close Form" : "➕ Add Product"}
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="mt-6">
//           {showForm ? (
//             editingProduct ? (
//               <EditProduct

//                 onUpdate={handleUpdateProduct}
//                 editingProduct={editingProduct}
//               />
//             ) : (
//               <AddProductForm onAdd={handleAddProduct} />
//             )
//           ) : (
//             <ProductTable
//               products={filteredProducts}
//               onDelete={handleDelete}
//               onEdit={handleEdit}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductPage;
