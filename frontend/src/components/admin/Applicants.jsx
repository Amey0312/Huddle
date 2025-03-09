import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();

    }, []);

    const evaluateResumes = async () => {
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/${params.id}/evaluate`, { withCredentials: true });
            if (res.data.success) {
                toast.success("Resume evaluation completed!");
                dispatch(setAllApplicants(res.data.applications));  // Update Redux state
            }
        } catch (error) {
            toast.error("Error evaluating resumes");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto">
                <h1 className="font-bold text-xl my-5">Applicants {applicants?.applications?.length}</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={evaluateResumes}>
                    Evaluate Resumes
                </button>
                <ApplicantsTable />
            </div>
        </div>
    )
}

export default Applicants