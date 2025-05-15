import React, { useState } from 'react';
import { toast } from 'react-toastify';
import documentApi from '../../Api/documentApi.js';
import { motion } from 'framer-motion';
import { logout } from '../../Redux/authSlice.js';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    generateKeyPair,
    signData,
    exportPublicKey,
    hashBuffer,
    arrayBufferToBase64,
} from "../../Utils/Encryption.jsx";
import ReCAPTCHA from 'react-google-recaptcha';
import reCaptcha from '../Auth/reCatpcha.jsx';
import { verifyRecaptcha } from '../../Api/captchaApi.js';

const UserDashboard = () => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [displaySize, setDisplaySize] = useState({ width: 1, height: 1 });
    const [threshold, setThreshold] = useState(0.5);
    const { capchaToken, recaptchaRef, handleRecaptcha } = reCaptcha();
    const [showMenu, setShowMenu] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.auth.user?.role); // Get user role from Redux

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!selected || !validTypes.includes(selected.type)) {
            toast.error("Only JPG, JPEG, PNG, or WEBP images are allowed.");
            return;
        }
        setFile(selected);
        setImagePreview(URL.createObjectURL(selected));
        setResult(null);
    };

    const handleSignOut = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/signin", { replace: true });
    };

    const handleScan = async () => {
        if (!file) return toast.error("Please upload an image first.");
        if (!capchaToken) return toast.error("Please complete the reCAPTCHA.");

        try {
            await verifyRecaptcha(capchaToken);
        } catch {
            return toast.error("reCAPTCHA failed verification.");
        }

        try {
            setLoading(true);
            const buffer = await file.arrayBuffer();
            const blob = new Blob([buffer], { type: file.type });
            const fileForVerification = new File([blob], file.name, { type: file.type });
            const fileForScan = new File([blob], file.name, { type: file.type });

            const fileBuffer = await fileForVerification.arrayBuffer();
            const { privateKey, publicKey } = await generateKeyPair();
            const hash = await hashBuffer(fileBuffer);
            const signature = await signData(privateKey, hash);
            const base64Signature = arrayBufferToBase64(signature);
            const exportedPublicKey = await exportPublicKey(publicKey);
            const base64PublicKey = arrayBufferToBase64(exportedPublicKey);
            const pemPublicKey = "-----BEGIN PUBLIC KEY-----\n" +
                base64PublicKey.match(/.{1,64}/g).join("\n") +
                "\n-----END PUBLIC KEY-----";

            const verificationFormData = new FormData();
            verificationFormData.append("image", fileForVerification);
            verificationFormData.append("signature", base64Signature);
            verificationFormData.append("publicKey", pemPublicKey);

            const verificationResponse = await documentApi.sendSignedDocument(verificationFormData);
            if (!verificationResponse?.success) {
                toast.error("Image has been tampered with or invalid signature.");
                setLoading(false);
                return;
            }

            const scanResult = await documentApi.scanDocument(fileForScan);
            if (!scanResult?.success) {
                toast.error("Image scan failed.");
                setLoading(false);
                return;
            }

            setResult(scanResult.data);
            toast.success("Image scanned successfully!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Scan failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 px-4">
            {/* Account Dropdown Menu */}
            <div className="absolute top-6 right-6">
                <div className="relative inline-block text-left">
                    <button
                        type="button"
                        className="inline-flex justify-center w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
                        id="menu-button"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        Account
                        <svg
                            className="-mr-1 ml-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {showMenu && (
                        <div
                            className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                        >
                            <div className="py-1 text-sm text-gray-700" role="none">
                                <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={handleSignOut}
                                    role="menuitem"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <h1 className="text-4xl font-extrabold mb-6 text-blue-400">License Plate Detection</h1>

            <div className="bg-gray-800/90 rounded-xl shadow-2xl p-8 max-w-3xl w-full border border-gray-700">

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-gray-100 file:bg-blue-600 file:text-white file:rounded-md file:px-4 file:py-2 file:mr-4 file:font-medium file:hover:bg-blue-700"
                    />
                    <p className="text-xs text-gray-400 mt-2">Supported: JPG, JPEG, PNG, WEBP</p>
                </div>

                {imagePreview && (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            <label className="text-sm text-gray-300">Confidence Threshold:</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-sm text-white">{(threshold * 100).toFixed(0)}%</span>
                        </div>

                        <div className="relative border border-gray-600 rounded-lg overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-[500px] object-contain"
                                onLoad={(e) => setDisplaySize({ width: e.target.naturalWidth, height: e.target.naturalHeight })}
                            />

                            {result?.predictions?.filter(p => p.confidence >= threshold).map((p, idx) => {
                                const scaleX = 100 / result.image.width;
                                const scaleY = 100 / result.image.height;
                                const left = (p.x - p.width / 2) * scaleX;
                                const top = (p.y - p.height / 2) * scaleY;
                                const boxWidth = p.width * scaleX;
                                const boxHeight = p.height * scaleY;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute border-2 border-green-400 bg-green-400/20 text-white text-xs px-1 rounded"
                                        style={{
                                            left: `${left}%`,
                                            top: `${top}%`,
                                            width: `${boxWidth}%`,
                                            height: `${boxHeight}%`,
                                        }}
                                    >
                                        <div className="absolute -top-6 left-0 bg-green-600 text-xs px-2 py-1 rounded shadow">
                                            {(p.confidence * 100).toFixed(1)}%
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="flex justify-center mt-6">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_SITE_KEY}
                        onChange={handleRecaptcha}
                        theme="dark"
                    />
                </div>

                <button
                    onClick={handleScan}
                    disabled={loading}
                    className="mt-6 w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold transition-colors duration-300"
                >
                    {loading ? "🔍 Scanning..." : "Scan Image"}
                </button>

                {userRole === 'admin' && (
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="mt-4 w-full py-3 rounded-md bg-purple-600 hover:bg-purple-700 font-semibold transition-colors duration-300"
                    >
                        Admin Dashboard
                    </button>
                )}

                {result?.predictions?.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-100">
                        <h3 className="text-lg font-bold mb-2">Scan Summary</h3>
                        <p>{result.predictions.filter(p => p.confidence >= threshold).length} plate(s) detected above {(threshold * 100).toFixed(0)}% threshold.</p>
                        <p>Highest confidence: <span className="text-green-400 font-semibold">{(Math.max(...result.predictions.map(p => p.confidence)) * 100).toFixed(1)}%</span></p>
                    </div>
                )}

                {result?.predictions?.filter(p => p.confidence >= threshold).length === 0 && (
                    <p className="text-center text-sm text-gray-400 mt-4">
                        No license plates detected above the selected threshold.
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
