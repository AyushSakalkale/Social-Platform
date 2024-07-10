import {useState} from "react";
import axios from "axios";
import "daisyui/dist/full.css"; // Import DaisyUI styles
import {USER_API_END_POINT} from "../utils/constant.js";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${USER_API_END_POINT}/forgetpassword`,
        {email}
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <div className="hero min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse outline-double outline-red-600">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Forget Password</h1>
          <p className="py-6">
            IF you want to reset your password click the Send reset link this
            will sent link to your email
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary">Send Reset Link</button>
            </div>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
