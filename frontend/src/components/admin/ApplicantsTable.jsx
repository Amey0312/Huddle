// import React from 'react'
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
// import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
// import { MoreHorizontal } from 'lucide-react';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import { APPLICATION_API_END_POINT } from '@/utils/constant';
// import axios from 'axios';

// const shortlistingStatus = ["Accepted", "Rejected"];


// const ApplicantsTable = () => {
//     const { applicants } = useSelector(store => store.application);

//     const statusHandler = async (status, id) => {
//         console.log('called');
//         try {
//             axios.defaults.withCredentials = true;
//             const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
//             console.log(res);
//             if (res.data.success) {
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     }

//     return (
//         <div>
//             <Table>
//                 <TableCaption>A list of your recent applied user</TableCaption>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>FullName</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Contact</TableHead>
//                         <TableHead>Resume</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Rating</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {
//                         applicants && applicants?.applications?.map((item) => (
//                             <tr key={item._id}>
//                                 <TableCell>{item?.applicant?.fullname}</TableCell>
//                                 <TableCell>{item?.applicant?.email}</TableCell>
//                                 <TableCell>{item?.applicant?.phoneNumber}</TableCell>
//                                 <TableCell >
//                                     {
//                                         item.applicant?.profile?.resume ? <a className="text-blue-600 cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span>NA</span>
//                                     }
//                                 </TableCell>
//                                 <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
//                                 <TableCell>{item?.score}</TableCell>
//                                 <TableCell className="float-right cursor-pointer">
//                                     <Popover>
//                                         <PopoverTrigger>
//                                             <MoreHorizontal />
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-32">
//                                             {
//                                                 shortlistingStatus.map((status, index) => {
//                                                     return (
//                                                         <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
//                                                             <span>{status}</span>
//                                                         </div>
//                                                     )
//                                                 })
//                                             }
//                                         </PopoverContent>
//                                     </Popover>
//                                 </TableCell>

//                             </tr>
//                         ))
//                     }

//                 </TableBody>

//             </Table>
//         </div>
//     )
// }

// export default ApplicantsTable;


// import React from 'react';

import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { setAllApplicants } from '@/redux/applicationSlice';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.put(`${APPLICATION_API_END_POINT}/status/${id}`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
                
                // Refresh applicants after updating status
                const updatedRes = await axios.get(`${APPLICATION_API_END_POINT}/${applicants.jobId}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(updatedRes.data.job));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating status");
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of applicants for this job</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants?.applications?.map((item) => (
                        <TableRow key={item._id} className={item.status === "accepted" ? "bg-green-100" : item.status === "rejected" ? "bg-red-100" : ""}>
                            <TableCell>{item?.applicant?.fullname}</TableCell>
                            <TableCell>{item?.applicant?.email}</TableCell>
                            <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                            <TableCell>
                                {item?.applicant?.profile?.resume ? (
                                    <a className="text-blue-600 cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">
                                        {item?.applicant?.profile?.resumeOriginalName || "View Resume"}
                                    </a>
                                ) : <span>NA</span>}
                            </TableCell>
                            <TableCell>{item?.applicant?.createdAt?.split("T")[0]}</TableCell>
                            <TableCell>{item?.score}</TableCell>
                            <TableCell className={item.status === "accepted" ? "text-green-600 font-semibold" : item.status === "rejected" ? "text-red-600 font-semibold" : "text-gray-600"}>
                                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Pending"}
                            </TableCell>
                            <TableCell className="float-right cursor-pointer">
                                <Popover>
                                    <PopoverTrigger>
                                        <MoreHorizontal />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        {shortlistingStatus.map((status, index) => (
                                            <div onClick={() => statusHandler(status.toLowerCase(), item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer hover:text-blue-500'>
                                                <span>{status}</span>
                                            </div>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ApplicantsTable;
