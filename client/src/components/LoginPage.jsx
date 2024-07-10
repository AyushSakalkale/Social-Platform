import {useState} from "react";
import {Link} from "react-router-dom";

import XSvg from "./X.jsx";

import {MdOutlineMail} from "react-icons/md";
import {MdPassword} from "react-icons/md";
import axios from "axios";
import {USER_API_END_POINT} from "../utils/constant.js";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {getUser} from "../redux/userSlice.jsx";
import {useDispatch} from "react-redux";

const LoginPage = () => {
  const a = import.meta.env.VITE_PORTNUMBER;
  console.log(a);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        {
          ...formData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(getUser(res?.data?.user));
      if (res?.data?.success) {
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const isError = false;

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            Login
          </button>
          <Link to="/forget-password">
            <p className="text-gray-200 hover:text-blue-500 text-sm">
              Forgot Password ??
            </p>
          </Link>
          {isError && <p className="text-emerald-500">Something went wrong</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
