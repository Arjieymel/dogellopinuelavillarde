import type { FC } from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import type { LoginCredentialsErrorFields } from "../../../interfaces/AuthInterface";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


interface LoginFormProps {
    message: (message: string, isFailed: boolean) => void;
}

const LoginForm: FC<LoginFormProps> = ({ message }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<LoginCredentialsErrorFields>({});

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        try {
            e.preventDefault();

            setIsLoading(true);

            await login(username, password);
            navigate('/genders');
        } catch (error: any) {
           if (error.response && error.response.status === 401) {
            setError({});
            message(error.response.data.message, true);
} else if (error.response && error.response.status === 422) {
                setError(error.response.data.errors);
                message("Please check your input", true);
            } else {
                console.error("An unexpected server error occurred during logging user in.", error );
                message("Login failed. Please try again.", true);
            }
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <>
    <form onSubmit={handleLogin}>
         <div className="mb-4">
            <FloatingLabelInput
             label="Username" 
             type="text"
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              autoFocus
              errors={error.username}
              />
         </div>
        <div className="mb-4">
            <FloatingLabelInput 
            label="Password"
             type="password" 
             name="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             errors={error.password}
             />
        </div>
        <SubmitButton className="w-full" label="Sign In" loading={isLoading} loadingLabel="Signing in..." />
    </form>
    </>
  )
}

export default LoginForm;