import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Upload, User, X, Check, Edit3, Crop, RotateCw, ArrowLeft } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatar: string | File) => void;
  onClose?: () => void;
  className?: string;
  isOnline?: boolean;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onAvatarChange,
  onClose,
  className = '',
  isOnline = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(!!onClose);
  const [selectedOption, setSelectedOption] = useState<'camera' | 'file' | 'predefined' | 'crop' | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [predefinedAvatars, setPredefinedAvatars] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  
  // Estados para crop
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Carregar avatares dinamicamente da pasta public/Avatares
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        // Lista dos nomes dos arquivos de avatar
        const avatarFiles = [
          'Captura de tela 2025-10-09 102901.png',
          'Captura de tela 2025-10-09 102917.png',
          'Captura de tela 2025-10-09 102938.png',
          'Captura de tela 2025-10-09 102954.png',
          'Captura de tela 2025-10-09 103021.png',
          'Captura de tela 2025-10-09 103038.png',
          'Captura de tela 2025-10-09 103052.png',
          'Captura de tela 2025-10-09 103111.png',
          'Captura de tela 2025-10-09 103126.png',
          'Captura de tela 2025-10-09 103144.png',
          'Captura de tela 2025-10-09 103156.png',
          'Captura de tela 2025-10-09 103221.png',
          'Captura de tela 2025-10-09 103235.png',
          'Captura de tela 2025-10-09 103254.png',
          'Captura de tela 2025-10-09 103311.png',
          'Captura de tela 2025-10-09 103322.png',
          'Captura de tela 2025-10-09 103344.png',
          'Captura de tela 2025-10-09 103354.png',
          'Captura de tela 2025-10-09 103405.png',
          'Captura de tela 2025-10-09 103417.png',
          'Captura de tela 2025-10-09 103440.png',
          'Captura de tela 2025-10-09 103452.png',
          'Captura de tela 2025-10-09 103507.png',
          'Captura de tela 2025-10-09 103518.png',
          'Captura de tela 2025-10-09 103531.png',
          'Captura de tela 2025-10-09 103546.png',
          'Captura de tela 2025-10-09 103600.png',
          'Captura de tela 2025-10-09 103618.png',
          'Captura de tela 2025-10-09 103636.png',
          'Captura de tela 2025-10-09 103658.png',
          'Captura de tela 2025-10-09 103715.png',
          'Captura de tela 2025-10-09 103735.png',
          'Captura de tela 2025-10-09 103745.png',
          'Captura de tela 2025-10-09 103759.png',
          'Captura de tela 2025-10-09 103810.png',
          'Captura de tela 2025-10-09 103825.png',
          'Captura de tela 2025-10-09 103838.png',
          'Captura de tela 2025-10-09 103850.png',
          'Captura de tela 2025-10-09 103935.png',
          'Captura de tela 2025-10-09 103951.png',
          'Captura de tela 2025-10-09 104005.png',
          'Captura de tela 2025-10-09 104015.png',
          'Captura de tela 2025-10-09 104035.png',
          'Captura de tela 2025-10-09 104045.png',
          'Captura de tela 2025-10-09 104055.png',
          'Captura de tela 2025-10-09 104115.png',
          'Captura de tela 2025-10-09 104141.png',
          'Captura de tela 2025-10-09 104152.png',
          'Captura de tela 2025-10-09 104208.png',
          'Captura de tela 2025-10-09 104218.png',
          'Captura de tela 2025-10-09 104235.png',
          'Captura de tela 2025-10-09 104311.png',
          'Captura de tela 2025-10-09 104330.png',
          'Captura de tela 2025-10-09 104347.png',
          'Captura de tela 2025-10-09 104400.png',
          'Captura de tela 2025-10-09 104418.png'
        ];

        // Converter para URLs da pasta public
        const avatarUrls = avatarFiles.map(filename => `/Avatares/${filename}`);
        setPredefinedAvatars(avatarUrls);
      } catch (error) {
        console.error('Erro ao carregar avatares:', error);
        // Fallback para um avatar padrão se houver erro
        setPredefinedAvatars(['/placeholder.svg']);
      }
    };

    loadAvatars();
  }, []);

  // Detectar mudanças no status de conexão online/offline
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Funções para drag & drop melhoradas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Só remove o estado se realmente saiu da zona de drop
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        setIsDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Feedback visual imediato
      setProcessingStep('Validando arquivo...');
      setIsProcessing(true);
      
      // Pequeno delay para mostrar o feedback
      setTimeout(() => {
        handleFileProcess(imageFile);
      }, 300);
    } else {
      // Feedback de erro melhorado
      alert('⚠️ Por favor, solte apenas arquivos de imagem (JPG, PNG, GIF)');
    }
  }, []);

  // Função para validar e comprimir imagem
  const validateAndCompressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validação de formato
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Formato não suportado. Use apenas JPEG, PNG ou WebP.'));
        return;
      }

      // Validação de tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error('Arquivo muito grande. Tamanho máximo: 10MB.'));
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Erro ao processar imagem.'));
        return;
      }

      img.onload = () => {
        // Definir tamanho máximo para compressão
        const maxWidth = 800;
        const maxHeight = 800;
        
        let { width, height } = img;
        
        // Redimensionar se necessário mantendo proporção
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade otimizada
        canvas.toBlob((blob) => {
          if (blob && blob instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Erro ao processar imagem.'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Erro ao comprimir imagem - blob inválido.'));
          }
        }, 'image/jpeg', 0.85); // Qualidade 85%
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem.'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Função para processar arquivos (upload ou drag & drop)
  const handleFileProcess = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingStep('Validando imagem...');
    
    try {
      setProcessingStep('Comprimindo imagem...');
      const compressedImage = await validateAndCompressImage(file);
      
      setProcessingStep('Preparando para edição...');
      setTimeout(() => {
        setImageToCrop(compressedImage);
        setCrop({
          unit: '%',
          width: 80,
          height: 80,
          x: 10,
          y: 10
        });
        setSelectedOption('crop');
        setIsProcessing(false);
        setProcessingStep('');
      }, 500);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar o arquivo. Tente novamente.');
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [validateAndCompressImage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 300, height: 300 } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = 300;
      canvas.height = 300;
      
      if (context) {
        context.drawImage(video, 0, 0, 300, 300);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handlePredefinedSelect = (avatar: string) => {
    onAvatarChange(avatar);
    setIsModalOpen(false);
  };

  // Função para aplicar o crop e finalizar
  const applyCrop = useCallback(() => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Aplicando recorte...');

    // Pequeno delay para mostrar o feedback visual
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        setProcessingStep('');
        return;
      }

      const image = imgRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        setProcessingStep('');
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      setProcessingStep('Processando imagem...');

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob && blob instanceof Blob) {
          setProcessingStep('Finalizando...');
          setTimeout(() => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              onAvatarChange(result);
              setIsModalOpen(false);
              setImageToCrop(null);
              setSelectedOption(null);
            };
            reader.onerror = () => {
              console.error('Erro ao processar blob no FileReader');
              setIsProcessing(false);
              setProcessingStep('');
            };
            reader.readAsDataURL(blob);
          }, 300);
        } else {
          console.error('Erro: blob inválido ou nulo');
          setIsProcessing(false);
          setProcessingStep('');
        }
      }, 'image/jpeg', 0.9);
    }, 200);
  }, [completedCrop, onAvatarChange]);

  const handleCameraConfirm = () => {
    if (capturedImage) {
      onAvatarChange(capturedImage);
      setIsModalOpen(false);
      setCapturedImage(null);
      stopCamera();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
    setCapturedImage(null);
    setIsProcessing(false);
    setProcessingStep('');
    setImageToCrop(null);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setCompletedCrop(null);
    setSearchTerm('');
    stopCamera();
    
    // Chama a função onClose se fornecida
    if (onClose) {
      onClose();
    }
  };

  const getAvatarPreview = () => {
    if (typeof currentAvatar === 'string') {
      return currentAvatar;
    }
    return predefinedAvatars[0] || '/placeholder.svg'; // Avatar padrão
  };

  return (
    <div className={className}>
      {/* Avatar Preview Aprimorado - só renderiza se não tiver onClose */}
      {!onClose && (
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden cursor-pointer hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setIsModalOpen(true)}
            >
              <img 
                src={getAvatarPreview()} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Overlay com ícone de edição */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit3 className="h-8 w-8 text-white" />
            </div>
            
            {/* Badge de status */}
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all duration-300 ${
              (isOnline !== undefined ? isOnline : onlineStatus) 
                ? 'bg-emerald-500' // Verde energia (#10B981) para online
                : 'bg-red-500'     // Vermelho (#EF4444) para offline
            }`}>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-2 text-sm text-green-600 hover:text-white hover:bg-green-600 border border-green-600 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Alterar Avatar
          </button>
        </div>
      )}

      {/* Modal Expandido para Toda a Tela */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 avatar-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 avatar-modal-enter mx-auto">
            {/* Header com Gradiente Expandido */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent"></div>
              <div className="relative flex justify-between items-center">
                <div className="text-center flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                    Escolher Avatar
                  </h3>
                  <p className="text-green-100 text-base sm:text-lg">
                    Personalize sua imagem de perfil
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-green-100 transition-colors p-3 hover:bg-white hover:bg-opacity-20 rounded-full flex-shrink-0 ml-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  aria-label="Fechar seletor de avatar"
                  tabIndex={0}
                >
                  <X className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal - Espaçamento Expandido */}
            <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-[calc(95vh-160px)]">
              {/* Conteúdo principal quando nenhuma opção está selecionada */}
              {!selectedOption && (
                <div className="space-y-12">
                  {/* Preview do Avatar Atual - Design Expandido */}
                  {currentAvatar && (
                    <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10">
                      <p className="text-lg font-medium text-gray-700 mb-8">Avatar atual:</p>
                      <div className="inline-block relative group">
                        <div className="relative">
                          <img 
                            src={currentAvatar} 
                            alt="Avatar atual" 
                            className="h-36 w-36 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300"></div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                          <Edit3 className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">Escolha uma nova opção abaixo para alterar</p>
                    </div>
                  )}

                   {/* Opções Principais - Layout Expandido em Grid */}
                   <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">Selecione uma opção:</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                      <button
                        onClick={() => {
                          setSelectedOption('camera');
                          startCamera();
                        }}
                        className="flex flex-col items-center p-6 lg:p-8 border-2 border-gray-200 rounded-3xl hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 group transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500"
                        tabIndex={0}
                        aria-label="Tirar foto com a câmera"
                      >
                        <div className="bg-green-100 p-6 lg:p-8 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                          <Camera className="h-10 w-10 lg:h-12 lg:w-12 text-green-600" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-gray-800 group-hover:text-green-700 text-xl lg:text-2xl block mb-2">Câmera</span>
                          <span className="text-base lg:text-lg text-gray-500 block">Tire uma foto agora mesmo</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOption('file');
                          fileInputRef.current?.click();
                        }}
                        className="flex flex-col items-center p-6 lg:p-8 border-2 border-gray-200 rounded-3xl hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 group transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                        tabIndex={0}
                        aria-label="Fazer upload de uma imagem do dispositivo"
                      >
                        <div className="bg-blue-100 p-6 lg:p-8 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
                          <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-gray-800 group-hover:text-green-700 text-xl lg:text-2xl block mb-2">Upload</span>
                          <span className="text-base lg:text-lg text-gray-500 block">Escolher do seu dispositivo</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedOption('predefined')}
                        className="flex flex-col items-center p-6 lg:p-8 border-2 border-gray-200 rounded-3xl hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 group transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500"
                        tabIndex={0}
                        aria-label="Escolher um avatar da galeria pré-definida"
                      >
                        <div className="bg-purple-100 p-6 lg:p-8 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                          <User className="h-10 w-10 lg:h-12 lg:w-12 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-gray-800 group-hover:text-green-700 text-xl lg:text-2xl block mb-2">Galeria</span>
                          <span className="text-base lg:text-lg text-gray-500 block">Avatares pré-definidos</span>
                        </div>
                      </button>
                    </div>
                   </div>

                   {/* Zona de Drag & Drop - Design Expandido */}
                    <div 
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragOver 
                          ? 'drag-zone-active border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-green-400 hover:bg-gray-50 drag-zone-hover'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDragOver 
                            ? 'bg-green-500 text-white avatar-pulse' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Upload size={40} />
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {isDragOver ? 'Solte a imagem aqui!' : 'Ou arraste uma imagem'}
                          </h3>
                          <p className="text-base text-gray-600">
                            Formatos suportados: JPG, PNG, GIF (máx. 5MB)
                          </p>
                        </div>
                        
                        {!isDragOver && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Ou</span>
                            <button className="text-green-600 hover:text-green-700 font-medium">
                              navegue pelos arquivos
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Loading State com etapas detalhadas */}
                  {isProcessing && (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Processando...</h4>
                        <p className="text-gray-600 mb-4">{processingStep || 'Preparando...'}</p>
                        
                        <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
                          <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{
                            width: processingStep.includes('Validando') ? '20%' : 
                                   processingStep.includes('Comprimindo') ? '40%' : 
                                   processingStep.includes('Preparando') ? '60%' : 
                                   processingStep.includes('Aplicando') ? '80%' : 
                                   processingStep.includes('Processando') ? '90%' : 
                                   processingStep.includes('Finalizando') ? '100%' : '10%'
                          }}></div>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          Por favor, aguarde enquanto processamos sua imagem...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seções específicas para cada opção */}
              {selectedOption === 'camera' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Voltar
                  </button>
                  
                  {!capturedImage ? (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                      />
                      <button
                        onClick={capturePhoto}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Capturar Foto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <img
                        src={capturedImage}
                        alt="Foto capturada"
                        className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCapturedImage(null)}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Tirar Novamente
                        </button>
                        <button
                          onClick={handleCameraConfirm}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Galeria de Avatares Pré-definidos Expandida */}
              {selectedOption === 'predefined' && (
                <div className="space-y-6 avatar-slide-up">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedOption(null)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Voltar</span>
                      </button>
                      <div className="h-6 w-px bg-gray-300"></div>
                      <h4 className="text-lg font-semibold text-gray-800">Galeria de Avatares</h4>
                    </div>
                  </div>

                  {/* Campo de busca melhorado */}
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      placeholder="Buscar avatares..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Grid responsivo de avatares expandido */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-6 max-h-[60vh] overflow-y-auto pr-2">
                    {predefinedAvatars
                      .filter(avatar => {
                        if (!searchTerm) return true;
                        const avatarName = avatar.split('/').pop()?.toLowerCase() || '';
                        return avatarName.includes(searchTerm.toLowerCase());
                      })
                      .map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => handlePredefinedSelect(avatar)}
                        className="aspect-square rounded-2xl lg:rounded-3xl border-2 border-gray-200 hover:border-green-500 transition-all duration-300 overflow-hidden hover:scale-105 transform shadow-sm hover:shadow-xl avatar-gallery-item group relative bg-white"
                      >
                        <img 
                          src={avatar} 
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Overlay de seleção */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Mensagem quando não há resultados */}
                  {predefinedAvatars.filter(avatar => {
                    if (!searchTerm) return true;
                    const avatarName = avatar.split('/').pop()?.toLowerCase() || '';
                    return avatarName.includes(searchTerm.toLowerCase());
                  }).length === 0 && searchTerm && (
                    <div className="text-center py-12 space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-800">Nenhum avatar encontrado</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                          Tente ajustar sua busca ou escolha uma das outras opções disponíveis.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Limpar busca</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      {predefinedAvatars.length} avatares disponíveis • Clique para selecionar
                    </p>
                  </div>
                </div>
              )}

              {/* Interface de Crop */}
              {selectedOption === 'crop' && imageToCrop && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Crop className="h-5 w-5" />
                      Ajustar Imagem
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setImageToCrop(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </button>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Arraste para ajustar a área do avatar. A imagem será cortada em formato circular.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                      className="max-w-full"
                    >
                      <img
                        ref={imgRef}
                        src={imageToCrop}
                        alt="Imagem para crop"
                        className="max-w-full max-h-96 object-contain"
                        onLoad={() => {
                          if (imgRef.current) {
                            const { width, height } = imgRef.current;
                            const size = Math.min(width, height) * 0.8;
                            const x = (width - size) / 2;
                            const y = (height - size) / 2;
                            
                            setCrop({
                              unit: 'px',
                              width: size,
                              height: size,
                              x: x,
                              y: y
                            });
                          }
                        }}
                      />
                    </ReactCrop>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setImageToCrop(null);
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={applyCrop}
                      disabled={!completedCrop}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Aplicar Crop
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for camera capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AvatarSelector;