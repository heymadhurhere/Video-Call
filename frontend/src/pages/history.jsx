import React from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';

export default function History() {


    const { getHistoryOfuser } = useContext(AuthContext);

    const [meetings, setMettings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfuser();
                setMettings(history);
                console.log(history);
            } catch {
                // IMPLEMENT SNACK BAR
            }
        }
        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <div>
            <IconButton onClick={() => {
                routeTo("/home")
            }} style={{ fontSize: "22px", marginLeft: "10px", padding: "10px", color: "blue" }}>
                <HomeIcon style={{ marginRight: "5px" }} />
                Home
            </IconButton>

            {
                meetings.length !== 0 ? meetings.map((e, i) => {
                    return (

                        <>

                            <Card key={i} variant="outlined">
                                <CardContent>
                                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                        Code: {e.meetingCode}
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                        Date: {formatDate(e.date)}
                                    </Typography>

                                </CardContent>
                            </Card></>
                    )
                }) : <></>
            }

        </div>
    )
}