import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/ReportIssue.css";

function ReportIssue() {
  const navigate = useNavigate();

  const [issue, setIssue] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let currentUser = null;
    try {
      currentUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      currentUser = null;
    }
    if (currentUser?.role === "ADMIN") {
      toast.info("Administrators manage issues from the dashboard.");
      navigate("/admin-dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "title" && !value.trim()) {
      error = "Issue title is required";
    } else if (name === "description" && !value.trim()) {
      error = "Please provide a description of the issue";
    } else if (name === "location" && !value.trim()) {
      error = "Location is required";
    } else if (name === "category" && !value) {
      error = "Please select a category";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIssue((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};
    if (!issue.title.trim()) newErrors.title = "Please enter an issue title";
    if (!issue.description.trim()) newErrors.description = "Please describe the civic issue";
    if (!issue.location.trim()) newErrors.location = "Please specify the location";
    if (!issue.category) newErrors.category = "Please choose a category";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    if (selectedImage && selectedImage.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("issue", JSON.stringify(issue));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await api.post("/issues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Civic issue reported successfully!");

      setIssue({
        title: "",
        description: "",
        location: "",
        category: "",
      });
      setSelectedImage(null);
      setPreviewUrl("");
      setErrors({});

      setTimeout(() => {
        navigate("/issues");
      }, 1000);
    } catch (error) {
      console.error(error);
      const errorMsg = getErrorMessage(error, "Failed to submit issue. Please check your inputs.");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-card">
        <h2>Report Civic Issue</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Issue Title"
              value={issue.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <textarea
              name="description"
              placeholder="Detailed description of the issue..."
              value={issue.description}
              onChange={handleChange}
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && <span className="field-error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="location"
              placeholder="Location (e.g. MG Road, Near Park)"
              value={issue.location}
              onChange={handleChange}
              className={errors.location ? "input-error" : ""}
            />
            {errors.location && <span className="field-error-text">{errors.location}</span>}
          </div>

          <div className="form-group">
            <select
              name="category"
              value={issue.category}
              onChange={handleChange}
              className={errors.category ? "input-error" : ""}
            >
              <option value="">Select Category</option>
              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Street Light">Street Light</option>
              <option value="Drainage">Drainage</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span className="field-error-text">{errors.category}</span>}
          </div>

          <div className="upload-area">
            <label className="upload-trigger">
              <span className="upload-icon">📎</span>
              <span className="upload-text">Choose Image</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageChange}
                hidden
              />
            </label>
            <span className="upload-hint">JPG, JPEG, PNG · max 5 MB</span>
            <span className="upload-filename">
              {selectedImage ? selectedImage.name : "No image selected"}
            </span>
          </div>

          {previewUrl && (
            <div className="image-preview-box">
              <img src={previewUrl} alt="Issue preview" />
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Report Issue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;
