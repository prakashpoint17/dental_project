import { BrowserRouter, Routes, Route } from "react-router-dom";
import DiagnosisPage from "../pages/DiagnosisPage";

function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DiagnosisPage/>}/>
                
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;