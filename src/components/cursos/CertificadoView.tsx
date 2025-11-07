import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award, CheckCircle2, Shield } from "lucide-react";
import { Curso } from "@/data/cursosData.ts";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Logo from "@/components/Logo";

interface CertificadoViewProps {
  certificado: any;
  curso: Curso;
}

export default function CertificadoView({ certificado, curso }: CertificadoViewProps) {
  const certificadoRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    // Gerar QR Code
    if (certificado?.qrCodeUrl) {
      QRCode.toDataURL(certificado.qrCodeUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [certificado]);

  const baixarPDF = async () => {
    if (!certificadoRef.current) return;
    
    setBaixando(true);
    try {
      // Aguardar um momento para garantir que tudo está renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capturar o certificado como imagem com alta qualidade
      const canvas = await html2canvas(certificadoRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      });

      // Criar PDF em orientação paisagem A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

      // Converter canvas para imagem e adicionar ao PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calcular dimensões mantendo a proporção
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;
      
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas é mais largo - ajustar pela largura
        finalHeight = pdfWidth / canvasAspectRatio;
      } else {
        // Canvas é mais alto - ajustar pela altura
        finalWidth = pdfHeight * canvasAspectRatio;
      }
      
      // Centralizar no PDF
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`certificado-${curso.slug}-${certificado.codigoAutenticacao}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setBaixando(false);
    }
  };

  const dataFormatada = new Date(certificado.dataEmissao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 px-2 sm:px-4 py-4">
      {/* Botões de ação */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Button
              size="lg"
              className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
              onClick={baixarPDF}
              disabled={baixando}
              data-testid="button-baixar-certificado"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {baixando ? 'Gerando PDF...' : 'Baixar Certificado em PDF'}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 md:mt-3 text-center">
            Seu certificado será gerado em alta qualidade (formato A4 paisagem)
          </p>
        </CardContent>
      </Card>

      {/* Certificado - 100% Responsivo e otimizado para PDF */}
      <div className="w-full">
        <div
          ref={certificadoRef}
          className="bg-white shadow-2xl rounded-lg border-4 sm:border-6 md:border-8 border-double border-blue-900 w-full mx-auto"
          style={{ 
            maxWidth: '1200px',
          }}
        >
          {/* Header Decorativo */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 h-2 sm:h-3 md:h-4"></div>
          
          <div className="p-6 sm:p-8 md:p-12 lg:p-16 relative">
            {/* Marca d'água de fundo */}
            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
              <Award className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 text-blue-600" />
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 space-y-6 sm:space-y-8">
              {/* Logo e Cabeçalho */}
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-3">
                  <Logo size="lg" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                  CERTIFICADO
                </h1>
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-sm sm:text-base font-semibold">DE CONCLUSÃO DE CURSO</p>
                </div>
              </div>

              {/* Corpo do Certificado */}
              <div className="text-center space-y-4 sm:space-y-6 py-6">
                <p className="text-base sm:text-lg text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificamos que
                </p>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 border-b-2 border-blue-200 pb-2 inline-block px-6 sm:px-8" style={{ fontFamily: 'Georgia, serif' }}>
                  {certificado.colaboradorNome}
                </h2>

                <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed px-4" style={{ fontFamily: 'Georgia, serif' }}>
                  concluiu com êxito o curso de <strong>{curso.titulo}</strong>, 
                  com carga horária de <strong>{certificado.cargaHoraria}</strong>, 
                  ministrado pela plataforma <strong>HumaniQ AI</strong>.
                </p>

                <p className="text-sm sm:text-base text-gray-600 px-4">
                  Conforme Trilha de Capacitação - Liderança e Saúde Psicossocial (NR01)
                </p>
              </div>

              {/* Footer com informações - Grid Responsivo */}
              <div className="border-t-2 border-gray-200 pt-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Coluna 1: Data e Local */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Data de Emissão</p>
                    <p className="text-base font-semibold text-gray-900">{dataFormatada}</p>
                    <p className="text-sm text-gray-600 mt-4">Plataforma Digital</p>
                    <p className="text-sm font-semibold text-gray-900">HumaniQ AI</p>
                  </div>

                  {/* Coluna 2: QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    {qrCodeDataUrl && (
                      <>
                        <img src={qrCodeDataUrl} alt="QR Code de Validação" className="w-24 h-24 mb-2" />
                        <p className="text-xs text-gray-600 text-center">
                          Escaneie para validar
                        </p>
                      </>
                    )}
                  </div>

                  {/* Coluna 3: Assinatura e Código */}
                  <div className="text-center space-y-3">
                    {/* Assinatura manuscrita SVG */}
                    <div className="mb-3 flex justify-center">
                      <svg width="180" height="60" viewBox="0 0 180 60" className="w-44" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <text 
                          x="90" 
                          y="40" 
                          fontSize="32" 
                          fontFamily="'Brush Script MT', 'Lucida Handwriting', cursive" 
                          fontStyle="italic"
                          fontWeight="bold"
                          fill="url(#signatureGradient)" 
                          textAnchor="middle"
                          transform="rotate(-2 90 30)"
                        >
                          HumaniQ AI
                        </text>
                      </svg>
                    </div>
                    
                    {/* Linha de assinatura */}
                    <div className="border-t-2 border-gray-900 pt-2 mx-auto w-48">
                      <p className="text-sm font-semibold text-gray-900">Certificado por HumaniQ AI</p>
                    </div>
                    
                    {/* Código de Autenticação */}
                    <div className="space-y-1 mt-3">
                      <p className="text-xs text-gray-600">Código de Autenticação:</p>
                      <p className="text-xs font-mono font-bold text-blue-700 break-all px-2">{certificado.codigoAutenticacao}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé Institucional */}
              <div className="text-center border-t border-gray-200 pt-4 mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Certificado Válido e Autêntico</span>
                </div>
                <p className="text-xs text-gray-400 break-all px-4">
                  Este certificado pode ser validado em: {certificado.qrCodeUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Decorativo */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 h-2 sm:h-3 md:h-4"></div>
        </div>
      </div>

      {/* Informações adicionais */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-green-900">Certificado Profissional Válido</h3>
              <ul className="text-xs sm:text-sm text-green-800 space-y-1">
                <li>✓ Código de autenticação único</li>
                <li>✓ QR Code para validação online</li>
                <li>✓ Registro em blockchain (em breve)</li>
                <li>✓ Reconhecido nacionalmente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
