import axios from "axios";
import {useState} from "react";
import toast from "react-hot-toast";
import {useDispatch, useSelector} from "react-redux";
import {USER_API_END_POINT} from "../utils/constant";
import {toggleRefresh, updateBio} from "../redux/userSlice";

const EditProfileModal = () => {
  const [formData, setFormData] = useState({
    bio: "",
  });

  const dispatch = useDispatch();

  const updateProfileHandler = async () => {
    try {
      const res = await axios.put(`${USER_API_END_POINT}/updateBio`, formData, {
        withCredentials: true,
      });
      console.log(res);
      dispatch(updateBio(res?.data?.user?.bio));
      dispatch(toggleRefresh());
      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  };
  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit Bio
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Bio</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileHandler();
            }}
          >
            <div className="flex flex-wrap gap-2">
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>

            <button className="btn btn-primary rounded-full btn-sm text-white">
              Update
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
