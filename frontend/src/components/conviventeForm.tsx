import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';

// Importe a ConviventeFormData existente (para o estado interno do Formik)
import type { ConviventeFormData } from '../types/Convivente';

// --- NOVA INTERFACE: ConviventeApiData ---
// Esta interface define a estrutura dos dados que serão enviados para a sua API.
// Ela reflete os tipos que o seu backend (Prisma) espera.
interface ConviventeApiData {
  nome: string;
  email?: string;
  quarto?: string;
  leito: number; // A API espera 'number' para leito
  dataNascimento: Date; // A API espera um objeto 'Date' para dataNascimento
  assistenteSocial?: string;
  cpf?: string;
  rg?: string;
  photoUrl?: string; // Se a URL da foto for enviada para o backend
  // Adicione outras propriedades que sua API espera aqui, se houver
}

interface ConviventeFormProps {
  initialData?: Partial<ConviventeFormData & { photoUrl?: string }>;
  // --- MUDANÇA AQUI: onSubmit agora espera ConviventeApiData ---
  // Isso informa ao TypeScript que a função onSubmit receberá os dados no formato da API.
  onSubmit: (values: ConviventeApiData, actions: FormikHelpers<ConviventeFormData>) => void | Promise<any>;
  onCancel?: () => void;
}

export const ConviventeForm: React.FC<ConviventeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // defaultValues continua usando ConviventeFormData, pois é o que o Formik gerencia internamente
  const defaultValues: ConviventeFormData = {
    nome: initialData?.nome || '',
    email: initialData?.email || '',
    quarto: initialData?.quarto || '',
    leito: initialData?.leito || '',
    dataNascimento: initialData?.dataNascimento || format(new Date(), 'yyyy-MM-dd'),
    assistenteSocial: initialData?.assistenteSocial || '',
    cpf: initialData?.cpf || '',
    rg: initialData?.rg || '',
    preview: initialData?.preview || initialData?.photoUrl || '',
    photo: initialData?.photo || null,
  };

  const validationSchema = yup.object({
    nome: yup.string().required('Nome é obrigatório'),
    // yup.date() pode validar strings de data como 'yyyy-MM-dd'
    dataNascimento: yup.date().required('Data obrigatória').typeError('Formato de data inválido'),
    leito: yup
      .number()
      .required('Leito é obrigatório')
      .integer('Leito deve ser um número inteiro')
      .typeError('Leito deve ser um número'),
    email: yup.string().optional().email('E-mail inválido'),
    cpf: yup.string().optional(),
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const cpf = e.target.value;
    const formattedCpf = cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFieldValue('cpf', formattedCpf);
  };

  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.preview || initialData?.photoUrl || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Hook para limpar a câmera ao desmontar o componente
  useEffect(() => {
    // Captura as referências atuais no momento da execução do efeito
    const currentStream = streamRef.current;
    const currentVideo = videoRef.current;

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        streamRef.current = null; // Garante que o ref seja limpo
      }
      if (currentVideo) {
        currentVideo.srcObject = null; // Limpa o srcObject do vídeo
      }
    };
  }, []); // Array de dependências vazio para que o efeito rode apenas uma vez (montagem/desmontagem)
  
  const capturePhoto = async (setFieldValue: FormikHelpers<ConviventeFormData>['setFieldValue']) => {
    setPreviewImage(null); // Limpa a pré-visualização para mostrar o feed da câmera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Espera o vídeo estar pronto para desenhar no canvas
        videoRef.current.oncanplay = () => {
          const canvas = canvasRef.current;
          if (canvas && videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
                  setFieldValue('photo', file); // Define o File no Formik
                  const previewUrl = URL.createObjectURL(file);
                  setPreviewImage(previewUrl); // Define a URL para exibição
                  setFieldValue('preview', previewUrl); // Define a URL no Formik
                }
                // Para a câmera após tirar a foto
                stream.getTracks().forEach(track => track.stop());
                if (videoRef.current) {
                  videoRef.current.srcObject = null; // Limpa o srcObject do vídeo
                }
              }, 'image/png');
            }
          }
        };
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      // O 'values' aqui é do tipo ConviventeFormData (do formulário)
      onSubmit={async (values, actions) => {
        // --- TRANSFORMAÇÃO PARA ConviventeApiData ---
        // Cria um novo objeto que corresponde à interface ConviventeApiData
        const dataForApi: ConviventeApiData = {
          nome: values.nome,
          email: values.email || undefined, // Garante que seja undefined se vazio
          quarto: values.quarto || undefined, // Garante que seja undefined se vazio
          // Converte 'leito' para número. Se for vazio, assume 0.
          leito: values.leito !== '' ? parseInt(String(values.leito), 10) : 0,
          // Converte 'dataNascimento' para um objeto Date.
          // O yup.date() já garante que values.dataNascimento é uma string de data válida aqui.
          dataNascimento: new Date(values.dataNascimento),
          assistenteSocial: values.assistenteSocial || undefined, // Garante que seja undefined se vazio
          cpf: values.cpf || undefined, // Garante que seja undefined se vazio
          rg: values.rg || undefined, // Garante que seja undefined se vazio
          // photoUrl: Deve vir do backend após o upload do 'photo' File.
          // Se 'preview' já for a URL final da imagem após upload, pode ser usado.
          // Caso contrário, a lógica de upload da foto deve ser externa a este formulário.
          photoUrl: values.preview // Usando preview como a URL final da foto
        };

        // Se você precisa enviar o 'File' (values.photo) separadamente para upload,
        // a lógica de upload deve estar no componente pai (AssistentePage.tsx)
        // e o 'photoUrl' resultante deve ser adicionado a 'dataForApi' antes de chamar onSubmit.

        // --- CORREÇÃO AQUI: Remove o 'as ConviventeFormData' ---
        // A função onSubmit já espera ConviventeApiData, então não é necessário o cast.
        await onSubmit(dataForApi, actions);
      }}
      enableReinitialize
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
          
          {/* Campos do Formulário */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <Field
              id="nome"
              name="nome"
              placeholder="Nome completo"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="nome" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={values.email || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <Field
              id="cpf"
              name="cpf"
              placeholder="CPF"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCpfChange(e, setFieldValue)}
              value={values.cpf || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="cpf" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">RG</label>
            <Field
              id="rg"
              name="rg"
              placeholder="RG"
              value={values.rg || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="rg" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
            <Field
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="dataNascimento" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="quarto" className="block text-sm font-medium text-gray-700 mb-1">Quarto</label>
            <Field
              id="quarto"
              name="quarto"
              placeholder="Quarto"
              value={values.quarto || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="quarto" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="assistenteSocial" className="block text-sm font-medium text-gray-700 mb-1">Assistente Social</label>
            <Field
              id="assistenteSocial"
              name="assistenteSocial"
              placeholder="Assistente Social"
              value={values.assistenteSocial || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="assistenteSocial" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="leito" className="block text-sm font-medium text-gray-700 mb-1">Leito</label>
            <Field
              id="leito"
              name="leito"
              type="number"
              value={values.leito || ''}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <ErrorMessage name="leito" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          {/* Integração da Foto e Câmera */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Foto:</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                setFieldValue('photo', file);
                if (file) {
                  const previewUrl = URL.createObjectURL(file);
                  setPreviewImage(previewUrl);
                  setFieldValue('preview', previewUrl);
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => capturePhoto(setFieldValue)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Capturar Foto
            </button>

            {/* Feed de vídeo para captura da câmera */}
            {/* O display é 'block' quando não há previewImage, mostrando o feed da câmera */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: 'auto', display: previewImage ? 'none' : 'block' }} 
              className="mt-4 rounded-md shadow-sm"
            ></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {/* Exibe a foto capturada ou a foto de upload */}
            {previewImage && (
              <div className="mt-2">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-md shadow-sm"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Cancelar
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ConviventeForm;
