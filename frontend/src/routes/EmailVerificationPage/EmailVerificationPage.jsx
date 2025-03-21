import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "./EmailVerificationPage.scss"

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex]?.focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1]?.focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = parseInt(code.join(""), 10);

		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch("http://localhost:5000/auth/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: verificationCode }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to verify email");
			}

			toast.success("Email verified successfully");
			navigate("/");
		} catch (err) {
			setError(err.message);
			toast.error(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

	return (
		<div className="email-verification-container">
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="verification-box"
			>
				<h2 className="title">Verify Your Email</h2>
				<p className="subtitle">Enter the 6-digit code sent to your email.</p>

				<form onSubmit={handleSubmit} className="verification-form">
					<div className="input-group">
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="verification-input"
							/>
						))}
					</div>
					{error && <p className="error-text">{error}</p>}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type="submit"
						disabled={isLoading || code.some((digit) => !digit)}
						className="verify-button"
					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</motion.button>
				</form>
			</motion.div>
		</div>
	);
	
	
};

export default EmailVerificationPage;
