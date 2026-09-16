import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCpu, FiZap, FiEye, FiRadio } from 'react-icons/fi';
import { useSearchStore } from '../../store/searchStore';

interface RealTimeScannerProps {
  isActive: boolean;
  progress: number;
  status: string;
  message: string;
  resultsCount: number;
}

export const RealTimeScanner: React.FC<RealTimeScannerProps> = ({
    isActive,progress,status,message,resultsCount
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scannerLines,setScannerLines] = useState<Array<{x:number;y:number;speed:number;length:number}>>([]);
    
    useEffect(() =>{
        if(!isActive) return;
        const canvas = canvasRef.current;
        if(!canvas) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        if(scannerLines.length === 0){
            const lines = [];
            for(let i =0;i<8; i++){
                lines.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speed: 0.5 + Math.random() * 1.5,
                    length: 20 + Math.random() * 40,
                });
            }
            setScannerLines(lines);
        }
        let animationId: number;
        const animate = () => {
            ctx.clearRect(0,0,width,height);
            ctx.strokeStyle = 'rgba(34,211,238,0.03)';
            ctx.lineWidth = 0.5;
            const gridsize = 39;
            for(let x=0; x<width; x+= gridsize){
                ctx.beginPath();
                ctx.moveTo(x,0);
                ctx.lineTo(x,height);
                ctx.stroke();
            } 
            for(let y=0; y<height; y+= gridsize){
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(width,y);
                ctx.stroke();
            } 

            const scanY = (performance.now() / 2000) % height;
            const gradient = ctx.createLinearGradient(0,scanY - 100,0,scanY + 100);
            gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
            gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
            gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0,scanY - 100,width,200);

            ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(width, scanY);
            ctx.stroke();
        }
    })
}