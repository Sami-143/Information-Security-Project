import React, { useState } from 'react';
import { toast } from 'react-toastify';
import docApi from '../../Api/documentApi.js';
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
    encryptWithPublicKey,
    importPublicKey,
} from "../../Utils/Encryption.jsx";
import ReCAPTCHA from 'react-google-recaptcha';
import reCaptcha from '../Auth/reCatpcha.jsx';
import { verifyRecaptcha } from '../../Api/captchaApi.js';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [displaySize, setDisplaySize] = useState({ width: 1, height: 1 });
    const [threshold, setThreshold] = useState(0.5); // default: 50%
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
        if (!file) {
            toast.error("Please upload a document image first.");
            return;
        }

        if (!capchaToken) {
            toast.error("Please complete the reCAPTCHA.");
            return;
        }
        // verify on backend
        try {
            await verifyRecaptcha(capchaToken);
        } catch (err) {
            toast.error("reCAPTCHA failed verification.");
            return;
        }

        try {
            setLoading(true);

            const fileBuffer = await file.arrayBuffer();

            // Step 1: Generate keypair
            const { privateKey, publicKey } = await generateKeyPair();

            // Step 2: Hash the file
            const hash = await hashBuffer(fileBuffer);

            // Step 3: Sign the hash
            const signature = await signData(privateKey, hash);
            const base64Signature = arrayBufferToBase64(signature);

            // Step 4: Export public key
            const exportedPublicKey = await exportPublicKey(publicKey);
            const base64PublicKey = arrayBufferToBase64(exportedPublicKey);
            const pemPublicKey =
                "-----BEGIN PUBLIC KEY-----\n" +
                base64PublicKey.match(/.{1,64}/g).join("\n") +
                "\n-----END PUBLIC KEY-----";

            // Step 5: Verify doc on backend (tampering check)
            const verificationFormData = new FormData();
            verificationFormData.append("image", file);
            verificationFormData.append("signature", base64Signature);
            verificationFormData.append("publicKey", pemPublicKey);

            const verificationResponse = await docApi.sendSignedDocument(verificationFormData);

            if (!verificationResponse?.success) {
                toast.error("Document signature is invalid or has been tampered with.");
                setLoading(false);
                return;
            }


            // Step 6: Proceed to scan the doc using ML model
            const scanResult = await docApi.scanDocument(file);
            setResult(scanResult.data);
            console.log("Scan Result:", result);
            toast.success("Document scanned successfully!");

            console.log("Scanned Result:", scanResult.data);
            console.log("Verified Hash:", hash);
            console.log("Signature:", base64Signature);



        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.detail || "Scan failed.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center py-10 px-4 relative">
            {/* Sign Out Button - Top Right */}
            <button
                onClick={handleSignOut}
                className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
                Sign Out
            </button>

            <h1 className="text-3xl font-bold mb-6 text-[#c9d1d9]">Document Forgery Detection</h1>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-2xl shadow-lg">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4 block w-full text-sm text-[#c9d1d9] file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                        file:bg-[#238636] file:text-white hover:file:bg-[#2ea043]"
                />

                <p className="text-xs text-[#8b949e] mb-4">
                    Allowed formats: JPG, JPEG, PNG, WEBP
                </p>

                {imagePreview && (
                    <>
                        {/* Confidence Threshold Slider */}
                        <div className="flex items-center gap-3 mb-4">
                            <label className="text-sm text-[#8b949e]">Confidence Threshold:</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-[#c9d1d9] text-sm">{(threshold * 100).toFixed(0)}%</span>
                        </div>

                        <div className="relative border border-[#30363d] rounded-md overflow-hidden">
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

                            {/* Overlay predictions */}
                            {result?.predictions
                                ?.filter((p) => p.confidence >= threshold)
                                .map((prediction, index) => {
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
                                            className="absolute border-2 border-red-500 bg-red-500/10 text-white text-xs px-1 rounded"
                                            style={{
                                                left: `${left}%`,
                                                top: `${top}%`,
                                                width: `${boxWidth}%`,
                                                height: `${boxHeight}%`,
                                            }}
                                        >
                                            <div className="absolute -top-6 left-0 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-50">
                                                Forgery: {(prediction.confidence * 100).toFixed(1)}%
                                            </div>

                                        </motion.div>
                                    );
                                })}
                        </div>
                    </>
                )}

                <div className="flex justify-center">
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
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-3 px-6 rounded-md mt-4 w-full"
                >
                    {loading ? "Scanning..." : "Scan Document"}
                </button>

                {/* Summary Box */}
                {result?.predictions?.length > 0 && (
                    <div className="mt-6 bg-[#161b22] p-4 rounded-md border border-[#30363d] text-[#c9d1d9] shadow">
                        <h3 className="text-lg font-semibold mb-2">Scan Summary</h3>
                        <p>
                            {result.predictions.filter(p => p.confidence >= threshold).length} forgery region(s) detected above{" "}
                            {(threshold * 100).toFixed(0)}% confidence threshold.
                        </p>
                        <p>
                            Highest confidence:{" "}
                            <span className="text-green-400 font-semibold">
                                {(Math.max(...result.predictions.map(p => p.confidence)) * 100).toFixed(1)}%
                            </span>
                        </p>
                    </div>
                )}

                {/* No results */}
                {result?.predictions?.filter(p => p.confidence >= threshold).length === 0 && (
                    <p className="text-center text-sm text-[#8b949e] mt-4">
                        No forgery detected above the selected threshold.
                    </p>
                )}

            </div>
        </div>
    );
};

export default Dashboard;