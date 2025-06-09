import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crop, Download, Move, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setImagePreview(url);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setWidth(Math.min(200, img.width).toString());
        setHeight(Math.min(200, img.height).toString());
        setCropArea({ x: 0, y: 0, width: Math.min(200, img.width), height: Math.min(200, img.height) });
      };
      img.src = url;
    }
  };

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;
    
    // Set canvas size to match display size
    const containerWidth = 600;
    const scale = containerWidth / img.naturalWidth;
    const displayHeight = img.naturalHeight * scale;
    
    canvas.width = containerWidth;
    canvas.height = displayHeight;
    
    // Draw image
    ctx.drawImage(img, 0, 0, containerWidth, displayHeight);
    
    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerWidth, displayHeight);
    
    // Clear crop area
    const scaledCropX = cropArea.x * scale;
    const scaledCropY = cropArea.y * scale;
    const scaledCropWidth = cropArea.width * scale;
    const scaledCropHeight = cropArea.height * scale;
    
    ctx.clearRect(scaledCropX, scaledCropY, scaledCropWidth, scaledCropHeight);
    ctx.drawImage(
      img,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      scaledCropX, scaledCropY, scaledCropWidth, scaledCropHeight
    );
    
    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(scaledCropX, scaledCropY, scaledCropWidth, scaledCropHeight);
    
    // Draw resize handles with adaptive sizing
    const handleSize = Math.max(12, Math.min(20, Math.min(scaledCropWidth, scaledCropHeight) * 0.1));
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Corner handles
    const corners = [
      { x: scaledCropX - handleSize/2, y: scaledCropY - handleSize/2, cursor: 'nw-resize' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY - handleSize/2, cursor: 'ne-resize' },
      { x: scaledCropX - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, cursor: 'sw-resize' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, cursor: 'se-resize' }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      ctx.strokeRect(corner.x, corner.y, handleSize, handleSize);
    });
    
    // Side handles
    const sides = [
      { x: scaledCropX + scaledCropWidth/2 - handleSize/2, y: scaledCropY - handleSize/2, cursor: 'n-resize' },
      { x: scaledCropX + scaledCropWidth/2 - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, cursor: 's-resize' },
      { x: scaledCropX - handleSize/2, y: scaledCropY + scaledCropHeight/2 - handleSize/2, cursor: 'w-resize' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY + scaledCropHeight/2 - handleSize/2, cursor: 'e-resize' }
    ];
    
    sides.forEach(side => {
      ctx.fillRect(side.x, side.y, handleSize, handleSize);
      ctx.strokeRect(side.x, side.y, handleSize, handleSize);
    });
    
    // Draw grid lines inside crop area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    const gridLines = 3;
    for (let i = 1; i < gridLines; i++) {
      const gridX = scaledCropX + (scaledCropWidth / gridLines) * i;
      const gridY = scaledCropY + (scaledCropHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(gridX, scaledCropY);
      ctx.lineTo(gridX, scaledCropY + scaledCropHeight);
      ctx.moveTo(scaledCropX, gridY);
      ctx.lineTo(scaledCropX + scaledCropWidth, gridY);
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (imagePreview && imageRef.current) {
      drawCanvas();
    }
  }, [cropArea, imagePreview]);

  const getHandleAtPosition = (x: number, y: number) => {
    if (!canvasRef.current || !imageRef.current) return null;
    
    const canvas = canvasRef.current;
    const scale = canvas.width / imageRef.current.naturalWidth;
    const scaledCropX = cropArea.x * scale;
    const scaledCropY = cropArea.y * scale;
    const scaledCropWidth = cropArea.width * scale;
    const scaledCropHeight = cropArea.height * scale;
    const handleSize = Math.max(12, Math.min(20, scaledCropWidth * 0.05)); // Adaptive handle size
    
    // Check corner handles
    const corners = [
      { x: scaledCropX - handleSize/2, y: scaledCropY - handleSize/2, handle: 'nw' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY - handleSize/2, handle: 'ne' },
      { x: scaledCropX - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, handle: 'sw' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, handle: 'se' }
    ];
    
    for (const corner of corners) {
      if (x >= corner.x && x <= corner.x + handleSize && y >= corner.y && y <= corner.y + handleSize) {
        return corner.handle;
      }
    }
    
    // Check side handles
    const sides = [
      { x: scaledCropX + scaledCropWidth/2 - handleSize/2, y: scaledCropY - handleSize/2, handle: 'n' },
      { x: scaledCropX + scaledCropWidth/2 - handleSize/2, y: scaledCropY + scaledCropHeight - handleSize/2, handle: 's' },
      { x: scaledCropX - handleSize/2, y: scaledCropY + scaledCropHeight/2 - handleSize/2, handle: 'w' },
      { x: scaledCropX + scaledCropWidth - handleSize/2, y: scaledCropY + scaledCropHeight/2 - handleSize/2, handle: 'e' }
    ];
    
    for (const side of sides) {
      if (x >= side.x && x <= side.x + handleSize && y >= side.y && y <= side.y + handleSize) {
        return side.handle;
      }
    }
    
    // Check if inside crop area for moving (with expanded tolerance for small images)
    const tolerance = Math.max(5, handleSize * 0.5);
    if (x >= scaledCropX - tolerance && x <= scaledCropX + scaledCropWidth + tolerance && 
        y >= scaledCropY - tolerance && y <= scaledCropY + scaledCropHeight + tolerance) {
      return 'move';
    }
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const handle = getHandleAtPosition(x, y);
    
    if (handle && handle !== 'move') {
      setIsResizing(true);
      setResizeHandle(handle);
    } else if (handle === 'move') {
      setIsDragging(true);
    }
    
    setDragStart({ x, y });
    setCropStart({ ...cropArea });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor based on handle position
    const handle = getHandleAtPosition(x, y);
    if (handle) {
      const cursorMap: Record<string, string> = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'w': 'w-resize',
        'e': 'e-resize',
        'move': 'move'
      };
      canvas.style.cursor = cursorMap[handle] || 'default';
    } else {
      canvas.style.cursor = 'default';
    }
    
    if (!isDragging && !isResizing) return;
    
    const scale = canvas.width / imageRef.current.naturalWidth;
    const deltaX = (x - dragStart.x) / scale;
    const deltaY = (y - dragStart.y) / scale;
    
    if (isDragging) {
      // Move crop area
      const newX = Math.max(0, Math.min(imageDimensions.width - cropArea.width, cropStart.x + deltaX));
      const newY = Math.max(0, Math.min(imageDimensions.height - cropArea.height, cropStart.y + deltaY));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      setX(Math.round(newX).toString());
      setY(Math.round(newY).toString());
    } else if (isResizing) {
      // Resize crop area based on handle
      let newCropArea = { ...cropStart };
      
      switch (resizeHandle) {
        case 'nw':
          newCropArea.x = Math.max(0, cropStart.x + deltaX);
          newCropArea.y = Math.max(0, cropStart.y + deltaY);
          newCropArea.width = Math.max(20, cropStart.width - deltaX);
          newCropArea.height = Math.max(20, cropStart.height - deltaY);
          break;
        case 'ne':
          newCropArea.y = Math.max(0, cropStart.y + deltaY);
          newCropArea.width = Math.max(20, cropStart.width + deltaX);
          newCropArea.height = Math.max(20, cropStart.height - deltaY);
          break;
        case 'sw':
          newCropArea.x = Math.max(0, cropStart.x + deltaX);
          newCropArea.width = Math.max(20, cropStart.width - deltaX);
          newCropArea.height = Math.max(20, cropStart.height + deltaY);
          break;
        case 'se':
          newCropArea.width = Math.max(20, cropStart.width + deltaX);
          newCropArea.height = Math.max(20, cropStart.height + deltaY);
          break;
        case 'n':
          newCropArea.y = Math.max(0, cropStart.y + deltaY);
          newCropArea.height = Math.max(20, cropStart.height - deltaY);
          break;
        case 's':
          newCropArea.height = Math.max(20, cropStart.height + deltaY);
          break;
        case 'w':
          newCropArea.x = Math.max(0, cropStart.x + deltaX);
          newCropArea.width = Math.max(20, cropStart.width - deltaX);
          break;
        case 'e':
          newCropArea.width = Math.max(20, cropStart.width + deltaX);
          break;
      }
      
      // Ensure crop area stays within image bounds
      newCropArea.x = Math.max(0, newCropArea.x);
      newCropArea.y = Math.max(0, newCropArea.y);
      newCropArea.width = Math.min(imageDimensions.width - newCropArea.x, newCropArea.width);
      newCropArea.height = Math.min(imageDimensions.height - newCropArea.y, newCropArea.height);
      
      setCropArea(newCropArea);
      setX(Math.round(newCropArea.x).toString());
      setY(Math.round(newCropArea.y).toString());
      setWidth(Math.round(newCropArea.width).toString());
      setHeight(Math.round(newCropArea.height).toString());
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleCrop = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive"
      });
      return;
    }

    if (!width || !height) {
      toast({
        title: "Error",
        description: "Please specify crop width and height",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Sending crop request with params:', { x, y, width, height, format });
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('x', x);
      formData.append('y', y);
      formData.append('width', width);
      formData.append('height', height);
      formData.append('format', format);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/image/crop', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to crop image');
      }

      const blob = await response.blob();
      console.log('Download blob size:', blob.size, 'bytes');
      
      // Create download with better error handling
      try {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped-${Date.now()}.${format}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Force click and cleanup
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (downloadError) {
        console.error('Download failed:', downloadError);
        throw new Error('Failed to download cropped image');
      }

      toast({
        title: "Success",
        description: "Image cropped successfully"
      });
    } catch (error) {
      console.error('Crop error:', error);
      const errorMessage = error instanceof Error && error.name === 'AbortError' ? 'Operation timed out' : 'Failed to crop image';
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCropFromInputs = () => {
    const newX = parseInt(x) || 0;
    const newY = parseInt(y) || 0;
    const newWidth = parseInt(width) || 100;
    const newHeight = parseInt(height) || 100;
    
    setCropArea({
      x: Math.max(0, Math.min(imageDimensions.width - newWidth, newX)),
      y: Math.max(0, Math.min(imageDimensions.height - newHeight, newY)),
      width: Math.min(newWidth, imageDimensions.width),
      height: Math.min(newHeight, imageDimensions.height)
    });
  };

  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: Math.min(200, imageDimensions.width), height: Math.min(200, imageDimensions.height) });
    setX('0');
    setY('0');
    setWidth(Math.min(200, imageDimensions.width).toString());
    setHeight(Math.min(200, imageDimensions.height).toString());
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Advanced Image Cropper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          {imagePreview && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visual Crop Editor</h3>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="Preview"
                      className="hidden"
                      onLoad={drawCanvas}
                    />
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className="max-w-full border border-gray-300 rounded cursor-move"
                      style={{ display: imagePreview ? 'block' : 'none' }}
                    />
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        Drag inside crop area to move
                      </div>
                      <div className="text-xs text-gray-500">
                        • Drag corners/sides to resize
                        • Visual grid guides alignment
                        • Real-time dimension updates
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Crop Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="x-coord">X Position</Label>
                      <Input
                        id="x-coord"
                        type="number"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                        onBlur={updateCropFromInputs}
                        min="0"
                        max={imageDimensions.width}
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-coord">Y Position</Label>
                      <Input
                        id="y-coord"
                        type="number"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                        onBlur={updateCropFromInputs}
                        min="0"
                        max={imageDimensions.height}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="crop-width">Width</Label>
                      <Input
                        id="crop-width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        onBlur={updateCropFromInputs}
                        min="1"
                        max={imageDimensions.width}
                      />
                    </div>
                    <div>
                      <Label htmlFor="crop-height">Height</Label>
                      <Input
                        id="crop-height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onBlur={updateCropFromInputs}
                        min="1"
                        max={imageDimensions.height}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Image Info</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Original: {imageDimensions.width} × {imageDimensions.height}px</p>
                      <p>Crop Area: {cropArea.width} × {cropArea.height}px</p>
                      <p>Position: ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetCrop} variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      onClick={handleCrop} 
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Crop & Download'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}