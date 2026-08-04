import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import "../styles/ReportIssue.css";

function ReportIssue() {

  const [issue, setIssue] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setIssue({
      ...issue,
      [e.target.name]: e.target.value,
    });
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
      toast.error("Only JPG, JPEG, and PNG files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
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

      const response = await api.post("/issues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      toast.success("Issue reported successfully!");

      setIssue({
        title: "",
        description: "",
        location: "",
        category: "",
      });
      setSelectedImage(null);
      setPreviewUrl("");
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(error.response.data.message || "Failed to report issue");
      } else {
        toast.error("Server not running or cannot connect");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-card">

        <h2>Report Civic Issue</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            value={issue.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={issue.description}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={issue.location}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={issue.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Road">Road</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Street Light">Street Light</option>
            <option value="Drainage">Drainage</option>
            <option value="Other">Other</option>
          </select>

          <label className="upload-label">
            <span>Upload image (JPG, JPEG, PNG · max 5 MB)</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleImageChange}
            />
          </label>

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