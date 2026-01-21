import React, { useEffect } from "react";
import {
  StackedCarousel,
  ResponsiveContainer,
} from "react-stacked-center-carousel";
// import Fab from "@material-ui/core/Fab";
// import ArrowBackIcon from "@material-ui/icons/ArrowBack";
// import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import { motion } from "framer-motion"
import { ArrowRight, Grid3X3, Upload, Play, Notebook, Store, ArrowLeftCircle, ArrowRightCircle, ShoppingCart, MoveUpRight, Flame, Box } from "lucide-react"
import apiClient from "@/utils/axios";
import { useCartStore } from "@/store/cartStore";


export default function Home() {
  const { data: productsData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsAPI.getAll(),
  })
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.src || "",
    })
  }

  // useEffect(() => {
  //   const tryFetching = async () => {
  //     try {
  //       const response = await apiClient.get("http://localhost/toyfront/wp-json/toyfront/v1/products");
  //       console.log("Products response:", response.data);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     }
  //   }
  //   console.log(
  //     apiClient.defaults.baseURL + "/toyfront/v1/products"
  //   )

  //   tryFetching()

  // }, [])

  return (
    <div>

      <div className="grid grid-cols-2 h-screen">
        {/* Left Section - White Background */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 flex flex-col justify-center"
        >
          {/* Headline Section */}
          <div>
            <p className="text-[#E74C8C] text-xs font-bold tracking-widest mb-6">UNLOCK THE VALUE OF JOY</p>
            <div className="mb-8">
              <h2 className="text-6xl font-black text-[#001F3F] leading-none mb-6">
                Welcome to
                <div className="flex items-center gap-4 mt-4">
                  <span>Toyfront Stores</span>
                </div>
              </h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="flex gap-3 items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                placeholder="Search by Collection, Category or Name"
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-rose-900 text-white px-6 py-2 rounded font-bold text-sm flex items-center gap-2"
              >
                Search
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-gray-50 rounded-lg p-6 cursor-pointer text-center">
              <div className="w-12 h-12 bg-[#E74C8C] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Store size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-[#001F3F] mb-2">Shop Now</h3>
              <p className="text-xs text-gray-600">Discover amazing products at unbeatable prices.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-gray-50 rounded-lg p-6 cursor-pointer text-center">
              <div className="w-12 h-12 bg-[#4f22d4] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Notebook size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-[#001F3F] mb-2">Sign up now!</h3>
              <p className="text-xs text-gray-600">Sign up now to enjoy amazing discounts & updates</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Gradient Background with  Cards */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-b from-[#FFB6D9] via-[#d8d8cf] to-[#eaf9ff] p-8 flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: `
      radial-gradient(at top left, #cdc79c, transparent 50%),
      radial-gradient(at top right, #c6c3c9, transparent 70%),
      radial-gradient(at bottom right, #d8d8cf, transparent 50%),
      radial-gradient(at bottom left, #d1d1d1, transparent 70%)
    `
          }}
        >
          {/*  Cards Grid */}
          <h1 className="text-4xl font-black text-[#2d2a1e] leading-none mb-2">Popular Products</h1>
          <p className="text-center pl-5 pr-5 pb-3">Discover what customers around the world can’t stop buying, and uncover products that bring smiles to your kids.</p>
          <ResponsiveCarousel data={productsData?.data} />
        </motion.div>
      </div>



      {/* Features Section */}
      <section className="relative py-20 bg-black/80">
        <img
          className="absolute top-0 bottom-0 left-0 right-0 h-full w-full object-cover opacity-10"
          src="http://localhost/toyfront/wp-content/uploads/2026/01/360_F_248124717_JjTxDAF3XFVkqvR0HBe56dOGWtly19QA.jpg" />
        <div className="container mx-auto px-4 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-200">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-200">Carefully curated selection of top-quality items</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-200">Safe and secure payment processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsData?.data.map((product) => {
              const cartItem = cartItems.find((item) => item.product_id === product.id)
              return (
                <div
                  key={product.id}
                  className="card hover:shadow-lg transition-shadow rounded-[20px]"
                >
                  <Link to={`/products/${product.slug}`}>
                    <div className="aspect-square bg-white rounded-[20px] mb-4 overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].src || "/placeholder.svg"}
                          alt={product.images[0].alt || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                    <h3 className="text-sm mb-0 line-clamp-2">{product.name}</h3>
                    <div className="flex justify-start items-center gap-2">
                      <p className="text-xl font-bold text-gray-600">${product.price}</p>
                      <p className="text-sm text-gray-600 line-through">${product.price}</p>
                    </div>
                  </Link>

                  {/* Conditional rendering based on cart */}
                  {cartItem ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => addItem({
                      product_id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image: product.images[0]?.src || "",
                    })}
                      className={`cursor-pointer relative mt-2 bg-gray-900 rounded-2xl w-full px-3 py-2 text-center flex items-center justify-center gap-2
                  ${product.stock_status === "instock" ? "bg-rose-900" : "bg-red-100"}`}>

                      {product.stock_status === "instock" ?
                        <div className="absolute left-3 bg-white h-[22px] w-[25px] rounded-full flex justify-center items-center">
                          <ShoppingCart size={10} />
                        </div>
                        :
                        <div className="absolute left-3 bg-white h-[22px] w-[25px] rounded-full flex justify-center items-center">
                          <Box size={10} />
                        </div>}

                      {product.stock_status === "instock" ? (
                        <span className="text-sm text-white font-medium">Add to Cart</span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>
                  )}
                </div>
              )
            }
            )}
          </div>
          <div className="text-center mt-12">
            <Link to="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


//  Card Component
const Card = ({ title, bid, time, image, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="relative h-[350px] rounded-full bg-white p-3 flex flex-col items-center justify-start shadow-lg"
    >
      <div className="w-48 h-48 rounded-full border-0 border-white overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
      </div>
      <motion.div
        className="absolute -bottom-3 left-1/3 bg-[#fff6c6] rounded-full p-4 shadow-lg"
        whileHover={{ scale: 1.1 }}
      >
        <button className="w-10 h-10 bg-[#001F3F] rounded-full flex items-center justify-center text-white">
          <ArrowRight size={16} />
        </button>
      </motion.div>
      <div className="mt-2 text-center">
        <p className="font-bold text-sm">{title}</p>
        <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
          <div>
            <p className="text-gray-600">Current Bid</p>
            <p className="font-bold">{bid}</p>
          </div>
          <div>
            <p className="text-gray-600">Ending In</p>
            <p className="font-bold">{time}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Rotating Text Circle Component
const RotatingCircle = () => {
  return (
    <motion.div
      className="relative w-40 h-40"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <defs>
          <path id="circlePath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
        </defs>
        <text className="text-xs font-bold fill-[#001F3F] tracking-widest">
          <textPath href="#circlePath" startOffset="0%">
            CREATE COLLECT ALL IN ONE ECOSYSTEM
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 border-4 border-white rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-white rounded-full" />
      </div>
    </motion.div>
  )
}

const ImageCircle = ({ image, title }: any) => {
  return (
    <div className="w-48 h-48 rounded-full border-[12px] border-white overflow-hidden shadow-lg">
      <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
    </div>
  )
}

const data_offline = [
  {
    images: [{ src: "https://images6.alphacoders.com/679/thumb-1920-679459.jpg" }],
    title: "Interstaller",
  },
  {
    images: [{ src: "https://images2.alphacoders.com/851/thumb-1920-85182.jpg" }],
    title: "Inception",
  },
  {
    images: [{ src: "https://images6.alphacoders.com/875/thumb-1920-875570.jpg" }],
    title: "Blade Runner 2049",
  },
  {
    images: [{ src: "https://images6.alphacoders.com/114/thumb-1920-1141749.jpg" }],
    title: "Icon man 3",
  },
  {
    images: [{ src: "https://images3.alphacoders.com/948/thumb-1920-948864.jpg" }],
    title: "Venom",
  },
  {
    images: [{ src: "https://images2.alphacoders.com/631/thumb-1920-631095.jpg" }],
    title: "Steins Gate",
  },
  {
    images: [{ src: "https://images4.alphacoders.com/665/thumb-1920-665242.png" }],
    title: "One Punch Man",
  },
  {
    images: [{ src: "https://images2.alphacoders.com/738/thumb-1920-738176.png" }],
    title: "A Silent Voice",
  },
  {
    images: [{ src: "https://images8.alphacoders.com/100/thumb-1920-1005531.jpg" }],
    title: "Demon Slayer",
  },
  {
    images: [{ src: "https://images2.alphacoders.com/582/thumb-1920-582804.png" }],
    title: "Attack On Titan",
  },
];

function ResponsiveCarousel({ data }: any) {
  const ref = React.useRef();
  return (
    <div style={{ width: "100%", position: "relative" }}>
      <ResponsiveContainer
        carouselRef={ref}
        render={(parentWidth, carouselRef) => {
          // If you want to use a ref to call the method of StackedCarousel, you cannot set the ref directly on the carousel component
          // This is because ResponsiveContainer will not render the carousel before its parent's width is determined
          // parentWidth is determined after your parent component mounts. Thus if you set the ref directly it will not work since the carousel is not rendered
          // Thus you need to pass your ref object to the ResponsiveContainer as the carouselRef prop and in your render function you will receive this ref object
          let currentVisibleSlide = 5;
          if (parentWidth <= 1440) currentVisibleSlide = 3;
          if (parentWidth <= 1080) currentVisibleSlide = 3;
          return (
            <>
              {data && <StackedCarousel
                ref={carouselRef}
                slideComponent={Card_}
                slideWidth={parentWidth < 600 ? parentWidth - 100 : 400}
                carouselWidth={parentWidth}
                data={data}
                currentVisibleSlide={currentVisibleSlide}
                maxVisibleSlide={5}
                useGrabCursor
              />}
            </>
          );
        }}
      />
      <div className="flex justify-center items-center gap-3 mt-4">
        <div
          className="bg-primary-700/50 p-5 rounded-full cursor-pointer hover:bg-primary-600 transition-all"
          // style={{ position: "absolute", bottom: "-20%", left: 10, zIndex: 10 }}
          onClick={() => { ref.current?.goBack() }}
        >
          <ArrowLeftCircle color="white" size={30} />
        </div>
        <div
          className="bg-primary-700/50 p-5 rounded-full cursor-pointer hover:bg-primary-600 transition-all"
          // style={{ position: "absolute", bottom: "-20%", right: 10, zIndex: 10 }}
          onClick={() => { ref.current?.goNext(6) }}
        >
          <ArrowRightCircle color="white" size={30} />
        </div>
      </div>
    </div>
  );
}

// Very import to memoize your Slide component otherwise there might be performance issue
// At minimum your should do a simple React.memo(SlideComponent)
// If you want the absolute best performance then pass in a custom comparator function like below 
const Card_ = React.memo(function (props) {
  const { data, dataIndex }: any = props;
  const { images, name, price, stock_status, slug } = data[dataIndex];
  return (
    <div
      style={{
        width: "100%",
        height: 400,
        userSelect: "none",
        borderRadius: 30,
        padding: 10,
      }}
      className="relative my-slide-component bg-white rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-start"
    >
      <img
        style={{
          height: "90%",
          width: "100%",
          objectFit: "contain",
          borderRadius: 20,
        }}
        draggable={false}
        src={images[0].src || "/placeholder.svg"}
      />

      {/* Top Floating Content */}
      <div className="absolute top-[8px] w-[95%] h-[56px] flex items-center justify-between p-1">
        <div className="bg-gray-300/40 backdrop-blur-sm h-[48px] w-28 rounded-full flex justify-center items-center">
          <p className="text-xs">33 items</p>
        </div>
        <div className="bg-gray-300/40 backdrop-blur-lg h-[48px] w-[54px] rounded-full flex justify-center items-center">
          <Flame />
        </div>
      </div>

      {/* Bottom Floating Content */}
      <div className="absolute bottom-[8px] w-[95%] h-[56px] rounded-full backdrop-blur-sm bg-gray-200/80 flex p-1">
        <div className="w-[80%] h-[52px] flex">
          <div className="bg-white h-[48px] w-[54px] rounded-full flex justify-center items-center">
            <ShoppingCart />
          </div>
          <div className="pl-2 flex flex-col">
            <h3 className="font-semibold text-md mb-0 pb-0 line-clamp-2">{name}</h3>
            <p className="text-lg font-bold text-primary-600 flex items-center mt-0 pt-0">${price}
              {stock_status === "instock" ? (
                <span className="text-sm text-green-600 font-medium ml-2">In Stock</span>
              ) : (
                <span className="text-sm text-red-600 font-medium ml-2">Out of Stock</span>
              )}
            </p>
          </div>
        </div>
        <Link to={`/products/${slug}`} className="w-[20%] h-[52px] flex justify-end">
          <div className="bg-rose-600 h-[48px] w-[54px] rounded-full flex justify-center items-center">
            <MoveUpRight color="white" />
          </div>
        </Link>
      </div>
    </div>
  );
});


{/* <Fab
          style={{ position: "absolute", top: "40%", left: 10, zIndex: 10 }}
          size="small"
          color="primary"
          onClick={() => {
            ref.current?.goBack();
          }}
        >
          <ArrowBackIcon />
        </Fab> */}
{/* <ArrowLeftCircle />
        <Fab
          style={{ position: "absolute", top: "40%", right: 10, zIndex: 10 }}
          size="small"
          color="primary"
          onClick={() => {
            ref.current?.goNext(6);
          }}
        >
          <ArrowForwardIcon />
        </Fab> */}