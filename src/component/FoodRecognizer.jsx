import React, { useState } from 'react';
import { Upload, Button, Image, Typography, Spin, message, Card } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function FoodRecognizer() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 改為物件形式儲存完整結果

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('請上傳圖片格式檔案');
    } else {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // 重置結果
    }
    return false;
  };

  const handleUpload = async () => {
    if (!imageFile) {
      message.warning('請先選擇圖片');
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    setLoading(true);
    try {
      const res = await fetch('http://192.168.0.110:3000/api/predict/', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('API 請求失敗');
      
      const data = await res.json();
      setResult(data); // 儲存完整回應資料
      
      // 顯示成功訊息
      message.success(`辨識成功: ${data.class} (置信度: ${data.confidence}%)`);
    } catch (error) {
      console.error('辨識錯誤:', error);
      message.error('辨識失敗，請稍後再試');
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <Card
      title={<Title level={3}>🍱 食物圖片辨識 AI</Title>}
      variant="outlined"
      style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}
    >
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        accept="image/*"
        style={{ marginBottom: 16 }}
      >
        <Button icon={<UploadOutlined />}>選擇圖片</Button>
      </Upload>

      {previewUrl && (
        <Image
          src={previewUrl}
          alt="預覽圖片"
          style={{ maxHeight: 240, objectFit: 'contain', marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleUpload}
          loading={loading}
          disabled={!imageFile}
        >
          開始辨識
        </Button>
      </div>

      {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}

      {result && (
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            辨識結果: 
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text>食物類別: {result.class}</Text>
          </div>
          <div>
            <Text>置信度: {result.confidence}%</Text>
          </div>
        </div>
      )}
    </Card>
  );
}