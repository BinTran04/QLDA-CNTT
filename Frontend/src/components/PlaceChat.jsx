import React from "react";
import { Button, Tooltip } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const PlaceChat = () => {
  const navigate = useNavigate();
  return (
    <Tooltip title="Nhắn tin hỗ trợ">
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={() => navigate("/my-messages")}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          fontSize: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
      />
    </Tooltip>
  );
};

export default PlaceChat;
