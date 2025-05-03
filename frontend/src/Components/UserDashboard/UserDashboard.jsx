import React, { useState } from 'react';
import { toast } from 'react-toastify';
import documentApi from '../../Api/documentApi.js';
import { motion } from 'framer-motion';
import { logout } from '../../Redux/authSlice.js';
import { useDispatch } from "react-redux";
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

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(selected.type)) {
                toast.error("Only JPG, JPEG, PNG, or WEBP images are allowed.");
                setFile(null);
                setImagePreview(null);
                return;
            }

            setFile(selected);
            setImagePreview(URL.createObjectURL(selected));
            setResult(null);
        }
    };

    const handleSignOut = () => {
        dispatch(logout());
        toast.success("Signed out successfully");
        navigate("/signin", { replace: true });
    };

    const handleScan = async () => {
        console.log('hereiam')
        if (!file) {
            toast.error("Please upload an image first.");
            return;
        }

        if (!capchaToken) {
            toast.error("Please complete the reCAPTCHA.");
            return;
        }
        console.log('herer')
        try {
            await verifyRecaptcha(capchaToken);
        } catch (err) {
            toast.error("reCAPTCHA failed verification.");
            return;
        }

        try {
            setLoading(true);
            // Create a new File object with the same content
            const buffer = await file.arrayBuffer(); // read once
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
            const pemPublicKey =
                "-----BEGIN PUBLIC KEY-----\n" +
                base64PublicKey.match(/.{1,64}/g).join("\n") +
                "\n-----END PUBLIC KEY-----";

            const verificationFormData = new FormData();
            verificationFormData.append("image", fileForVerification);
            verificationFormData.append("signature", base64Signature);
            verificationFormData.append("publicKey", pemPublicKey);

            console.log('jere')

            const verificationResponse = await documentApi.sendSignedDocument(verificationFormData);
            console.log("Verification response:", verificationResponse);

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
            console.log("Scan result:", scanResult.data);
            toast.success("Image scanned successfully!");
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.detail || "Scan failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4 relative">
            <button
                onClick={handleSignOut}
                className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
                Sign Out
            </button>

            <h1 className="text-3xl font-bold mb-6 text-gray-200">License Plate Detection Dashboard</h1>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl shadow-lg">
                <label className="block mb-2 text-sm font-medium text-gray-300">Upload Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />

                <p className="text-xs text-gray-400 mb-4">
                    Allowed formats: JPG, JPEG, PNG, WEBP
                </p>

                {imagePreview && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <label className="text-sm text-gray-400">Confidence Threshold:</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-gray-200 text-sm">{(threshold * 100).toFixed(0)}%</span>
                        </div>

                        <div className="relative border border-gray-700 rounded-md overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-[500px] object-contain"
                                onLoad={(e) =>
                                    setDisplaySize({
                                        width: e.target.naturalWidth,
                                        height: e.target.naturalHeight,
                                    })
                                }
                            />

                            {result?.predictions?.filter((p) => p.confidence >= threshold).map((prediction, index) => {
                                const scaleX = 100 / result.image.width;
                                const scaleY = 100 / result.image.height;
                                const left = (prediction.x - prediction.width / 2) * scaleX;
                                const top = (prediction.y - prediction.height / 2) * scaleY;
                                const boxWidth = prediction.width * scaleX;
                                const boxHeight = prediction.height * scaleY;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute border-2 border-yellow-500 bg-yellow-500/10 text-white text-xs px-1 rounded"
                                        style={{
                                            left: `${left}%`,
                                            top: `${top}%`,
                                            width: `${boxWidth}%`,
                                            height: `${boxHeight}%`,
                                        }}
                                    >
                                        <div className="absolute -top-6 left-0 bg-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
                                            Plate: {(prediction.confidence * 100).toFixed(1)}%
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="flex justify-center mt-4">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md mt-4 w-full"
                >
                    {loading ? "Scanning..." : "Scan Image"}
                </button>

                {result?.predictions?.length > 0 && (
                    <div className="mt-6 bg-gray-700 p-4 rounded-md border border-gray-600 text-gray-100">
                        <h3 className="text-lg font-semibold mb-2">Scan Summary</h3>
                        <p>{result.predictions.filter(p => p.confidence >= threshold).length} license plate(s) detected above {(threshold * 100).toFixed(0)}% threshold.</p>
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
