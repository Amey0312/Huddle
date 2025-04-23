// import React, { useEffect } from 'react'
// import Navbar from '../shared/Navbar'
// import ApplicantsTable from './ApplicantsTable'
// import axios from 'axios';
// import { APPLICATION_API_END_POINT } from '@/utils/constant';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { setAllApplicants } from '@/redux/applicationSlice';

// const Applicants = () => {
//     const params = useParams();
//     const dispatch = useDispatch();
//     const {applicants} = useSelector(store=>store.application);

//     useEffect(() => {
//         const fetchAllApplicants = async () => {
//             try {
//                 const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
//                 dispatch(setAllApplicants(res.data.job));
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//         fetchAllApplicants();
//     }, []);
//     return (
//         <div>
//             <Navbar />
//             <div className='max-w-7xl mx-auto'>
//                 <h1 className='font-bold text-xl my-5'>Applicants {applicants?.applications?.length}</h1>
//                 <ApplicantsTable />
//             </div>
//         </div>
//     )
// }

// export default Applicants;

// import React, { useEffect, useState } from 'react';
// import Navbar from '../shared/Navbar';
// import ApplicantsTable from './ApplicantsTable';
// import axios from 'axios';
// import { APPLICATION_API_END_POINT } from '@/utils/constant';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { setAllApplicants } from '@/redux/applicationSlice';
// import { toast } from 'sonner';

// const Applicants = () => {
//     const { id } = useParams();
//     const dispatch = useDispatch();
//     const { applicants } = useSelector(store => store.application);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         const fetchAllApplicants = async () => {
//             try {
//                 const res = await axios.get(`${APPLICATION_API_END_POINT}/${id}/applicants`, { withCredentials: true });
//                 dispatch(setAllApplicants(res.data.job));
//             } catch (error) {
//                 console.log(error);
//                 toast.error("Failed to fetch applicants");
//             }
//         };
//         fetchAllApplicants();
//     }, [id, dispatch]);

//     const autoEvaluateApplicants = async () => {
//         setLoading(true);
//         try {
//             const res = await axios.post(`${APPLICATION_API_END_POINT}/${id}/process-applications`, {}, { withCredentials: true });
//             if (res.data.success) {
//                 toast.success("Applicants evaluated and shortlisted!");
//                 dispatch(setAllApplicants(res.data.job));
//             } else {
//                 toast.error("Failed to process applicants");
//             }
//         } catch (error) {
//             toast.error("Error processing applications");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <Navbar />
//             <div className='max-w-7xl mx-auto'>
//                 <h1 className='font-bold text-xl my-5'>Applicants ({applicants?.applications?.length || 0})</h1>
                
//                 <div className="flex justify-between items-center mb-4">
//                     <button 
//                         onClick={autoEvaluateApplicants} 
//                         disabled={loading}
//                         className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
//                     >
//                         {loading ? "Processing..." : "Auto-Evaluate Applicants"}
//                     </button>
//                 </div>

//                 <ApplicantsTable />
//             </div>
//         </div>
//     );
// };

// export default Applicants;

import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { toast } from 'sonner';

const Applicants = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch applicants");
            }
        };
        fetchAllApplicants();
    }, [id, dispatch]);

    const autoEvaluateApplicants = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/${id}/process-applications`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success("Applicants evaluated and shortlisted!");
                dispatch(setAllApplicants(res.data.job));
            } else {
                toast.error("Failed to process applicants");
            }
        } catch (error) {
            toast.error("Error processing applications");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <h1 className='font-bold text-xl my-5'>Applicants ({applicants?.applications?.length || 0})</h1>
                
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={autoEvaluateApplicants} 
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Auto-Evaluate Applicants"}
                    </button>
                </div>
                <ApplicantsTable />
            </div>
        </div>
    );
};

export default Applicants;
