import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {USER_API_END_POINT} from "../utils/constant";

const ResetPassword = () => {
  const {token} = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${USER_API_END_POINT}/reset-password/${token}`,
        {password}
      );
      setMessage(response.data.message);
      setPassword("");
      navigate("/login");
    } catch (error) {
      setMessage(error.response.data.message || "Something went wrong");
      setPassword("");
    }
  };

  return (
    <div className="hero  min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse ">
        <div className="text-center lg:text-left">
          <img
            src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg"
            className="max-w-sm rounded-lg shadow-2xl"
          />
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Set New Password</button>
            </div>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
