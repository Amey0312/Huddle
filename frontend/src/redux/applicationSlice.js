// import { createSlice } from "@reduxjs/toolkit";

// const applicationSlice = createSlice({
//     name:'application',
//     initialState: {
//         applicants: null,  // initialized as empty array
//       },      
//     reducers:{
//         setAllApplicants:(state,action) => {
//             state.applicants = action.payload || [];
//         }
//     }
// });
// export const {setAllApplicants} = applicationSlice.actions;
// export default applicationSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: "application",
    initialState: {
        applicants: [],
        acceptedApplicants: [],
        rejectedApplicants: []
    },
    reducers: {
        setAllApplicants: (state, action) => {
            state.applicants = action.payload.applications;
            state.acceptedApplicants = action.payload.applications.filter(app => app.status === "accepted");
            state.rejectedApplicants = action.payload.applications.filter(app => app.status === "rejected");
        }
    }
});

export const { setAllApplicants } = applicationSlice.actions;
export default applicationSlice.reducer;
