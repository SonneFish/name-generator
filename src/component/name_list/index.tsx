import * as CommonType from "../../../script/common/type";
import { Table, Button, Tooltip, message, Space } from "antd";
import { DislikeOutlined, LikeOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "./index.less";

export default ({
  nameList = [],
  columnCount = 5,
  surnameLength = 1,
  onBlacklistChange,
  onLikelistChange,
  onCharBlacklistChange,
  onCharLikelistChange,
  onAddToViewedList,
  onRemoveFromViewedList,
}: {
  nameList: CommonType.Type_Name[];
  // 每行展示x个姓名
  columnCount: number;
  // 姓氏长度
  surnameLength: number;
  // 黑名单变化回调
  onBlacklistChange?: (blacklist: string[]) => void;
  // 喜欢名单变化回调
  onLikelistChange?: (likelist: string[]) => void;
  // 单字黑名单变化回调
  onCharBlacklistChange?: (charBlacklist: string[]) => void;
  // 单字喜欢名单变化回调
  onCharLikelistChange?: (charLikelist: string[]) => void;
  // 添加到已阅览名单回调
  onAddToViewedList?: (currentPageNames: string[]) => void;
  // 从已阅览名单移除回调
  onRemoveFromViewedList?: (currentPageNames: string[]) => void;
}) => {
  // 从本地存储获取黑名单和喜欢名单
  const getBlacklist = () => {
    const blacklist = localStorage.getItem('nameBlacklist');
    return blacklist ? JSON.parse(blacklist) : [];
  };

  const getLikelist = () => {
    const likelist = localStorage.getItem('nameLikelist');
    return likelist ? JSON.parse(likelist) : [];
  };

  // 当前页数据状态
  const [currentPageData, setCurrentPageData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const [tableDataSource, setTableDataSource] = useState<any[]>([]);

  // 在组件初始化和tableDataSource变化时更新当前页数据
  useEffect(() => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageData = tableDataSource.slice(startIndex, endIndex);
    
    setCurrentPageData(currentPageData);
  }, [tableDataSource, pagination, nameList]);

  // 初始化表格数据源
  useEffect(() => {
    let index = 0;

    let realNameList: string[] = [];
    for (let name of nameList) {
      index++;
      let realName = `${index.toString().padStart(2, "0")} - ${name.demoStr}`;
      realNameList.push(realName);
    }

    // 拆分成实际姓名列表
    let newTableDataSource = [];
    while (realNameList.length > 0) {
      let row: {
        key: string;
        [key: `name-${number}`]: string;
      } = {
        key: "",
      };
      for (let i = 1; i <= columnCount; i++) {
        let realname = realNameList.shift();
        row[`name-${i}`] = realname ?? "";
        row["key"] = `${realname}-${i}`;
      }
      newTableDataSource.push(row);
    }
    
    // 更新状态
    setTableDataSource(newTableDataSource);
  }, [nameList, columnCount]);

  // 添加到单字黑名单
  const addToCharBlacklist = (char: string) => {
    // 获取当前单字黑名单
    const charBlacklist = localStorage.getItem('charBlacklist');
    const blacklist = charBlacklist ? JSON.parse(charBlacklist) : [];
    
    // 获取当前单字喜欢名单
    const charLikelist = localStorage.getItem('charLikelist');
    const likelist = charLikelist ? JSON.parse(charLikelist) : [];
    
    if (!blacklist.includes(char)) {
      // 如果字在喜欢名单中，先从喜欢名单中移除
      if (likelist.includes(char)) {
        const newLikelist = likelist.filter((item: string) => item !== char);
        localStorage.setItem('charLikelist', JSON.stringify(newLikelist));
        // 通知父组件喜欢名单变化
        if (onCharLikelistChange) {
          onCharLikelistChange(newLikelist);
        }
        // 强提示：字已从喜欢名单中移除
        message.warning(`字 "${char}" 已从单字喜欢名单中移除并加入单字黑名单`);
      } else {
        message.success(`已将字 "${char}" 加入单字黑名单`);
      }
      
      blacklist.push(char);
      localStorage.setItem('charBlacklist', JSON.stringify(blacklist));
      // 调用回调函数通知父组件
      if (onCharBlacklistChange) {
        onCharBlacklistChange(blacklist);
      }
      // 重新生成候选名
      setTimeout(() => {
        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
      }, 500);
    } else {
      message.info(`字 "${char}" 已在单字黑名单中`);
    }
  };

  // 添加到单字喜欢名单
  const addToCharLikelist = (char: string) => {
    // 获取当前单字喜欢名单
    const charLikelist = localStorage.getItem('charLikelist');
    const likelist = charLikelist ? JSON.parse(charLikelist) : [];
    
    // 获取当前单字黑名单
    const charBlacklist = localStorage.getItem('charBlacklist');
    const blacklist = charBlacklist ? JSON.parse(charBlacklist) : [];
    
    if (!likelist.includes(char)) {
      // 如果字在黑名单中，先从黑名单中移除
      if (blacklist.includes(char)) {
        const newBlacklist = blacklist.filter((item: string) => item !== char);
        localStorage.setItem('charBlacklist', JSON.stringify(newBlacklist));
        // 通知父组件黑名单变化
        if (onCharBlacklistChange) {
          onCharBlacklistChange(newBlacklist);
        }
        // 强提示：字已从黑名单中移除
        message.warning(`字 "${char}" 已从单字黑名单中移除并加入单字喜欢名单`);
      } else {
        message.success(`已将字 "${char}" 加入单字喜欢名单`);
      }
      
      likelist.push(char);
      localStorage.setItem('charLikelist', JSON.stringify(likelist));
      // 调用回调函数通知父组件
      if (onCharLikelistChange) {
        onCharLikelistChange(likelist);
      }
      // 重新生成候选名
      setTimeout(() => {
        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
      }, 500);
    } else {
      message.info(`字 "${char}" 已在单字喜欢名单中`);
    }
  };

  // 长按事件处理
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);
  
  const handleCharPressStart = (char: string) => {
    // 设置长按定时器，500ms后触发
    setIsLongPressTriggered(false);
    const timer = setTimeout(() => {
      addToCharLikelist(char);
      setIsLongPressTriggered(true);
    }, 500);
    setLongPressTimer(timer);
  };
  
  const handleCharPressEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    // 清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // 如果有事件对象，恢复背景色
    if (e && 'currentTarget' in e) {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }
  };

  // 添加到黑名单
  const addToBlacklist = (name: string) => {
    const blacklist = getBlacklist();
    const likelist = getLikelist();
    
    if (!blacklist.includes(name)) {
      // 检查是否在喜欢名单中
      if (likelist.includes(name)) {
        // 从喜欢名单中移除
        const newLikelist = likelist.filter((item: string) => item !== name);
        localStorage.setItem('nameLikelist', JSON.stringify(newLikelist));
        // 通知父组件喜欢名单变化
        if (onLikelistChange) {
          onLikelistChange(newLikelist);
        }
        message.warning(`"${name}" 已从喜欢名单移除并加入黑名单`);
      } else {
        message.success(`已将 "${name}" 加入黑名单`);
      }
      
      blacklist.push(name);
      localStorage.setItem('nameBlacklist', JSON.stringify(blacklist));
      // 调用回调函数通知父组件
      if (onBlacklistChange) {
        onBlacklistChange(blacklist);
      }
      // 重新生成候选名
      setTimeout(() => {
        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
      }, 500);
    } else {
      message.info(`"${name}" 已在黑名单中`);
    }
  };

  // 处理表格变化事件（分页、排序、筛选）
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination(pagination);
  };

  // 获取当前页的姓名列表
  const getCurrentPageNames = () => {
    const names: string[] = [];
    currentPageData.forEach(row => {
      for (let i = 1; i <= columnCount; i++) {
        const nameField = `name-${i}`;
        if (row[nameField]) {
          // 从文本中提取姓名（去除序号）
          const nameMatch = row[nameField].match(/\d+ - (.+)/);
          const fullName = nameMatch ? nameMatch[1] : row[nameField];
          if (fullName) {
            // 只获取名字部分（去掉姓氏）
            const givenName = fullName.substring(surnameLength);
            names.push(givenName);
          }
        }
      }
    });
    return names;
  };

  // 添加当前页到已阅览名单
  const handleAddToViewedList = () => {
    const currentPageNames = getCurrentPageNames();
    if (onAddToViewedList) {
      onAddToViewedList(currentPageNames);
    }
  };

  // 取消添加当前页到已阅览名单
  const handleRemoveFromViewedList = () => {
    const currentPageNames = getCurrentPageNames();
    if (onRemoveFromViewedList) {
      onRemoveFromViewedList(currentPageNames);
    }
  };

  // 添加到喜欢名单
  const addToLikelist = (name: string) => {
    const likelist = getLikelist();
    const blacklist = getBlacklist();
    
    if (!likelist.includes(name)) {
      // 检查是否在黑名单中
      if (blacklist.includes(name)) {
        // 从黑名单中移除
        const newBlacklist = blacklist.filter((item: string) => item !== name);
        localStorage.setItem('nameBlacklist', JSON.stringify(newBlacklist));
        // 通知父组件黑名单变化
        if (onBlacklistChange) {
          onBlacklistChange(newBlacklist);
        }
        message.warning(`"${name}" 已从黑名单移除并加入喜欢名单`);
      } else {
        message.success(`已将 "${name}" 加入喜欢名单`);
      }
      
      likelist.push(name);
      localStorage.setItem('nameLikelist', JSON.stringify(likelist));
      // 调用回调函数通知父组件
      if (onLikelistChange) {
        onLikelistChange(likelist);
      }
      // 重新生成候选名
      setTimeout(() => {
        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
      }, 500);
    } else {
      message.info(`"${name}" 已在喜欢名单中`);
    }
  };

  let columns = [];
  for (let i = 1; i <= columnCount; i++) {
    columns.push({
      title: `姓名-${i}`,
      dataIndex: `name-${i}`,
      key: `name-${i}`,
      render: (text: string) => {
        if (!text) return null;
        
        // 从文本中提取姓名（去除序号）
        const nameMatch = text.match(/\d+ - (.+)/);
        const fullName = nameMatch ? nameMatch[1] : text;
        
        // 获取姓氏长度
        const surnameLen = surnameLength;
        
        // 将姓名拆分为姓氏和名字部分
        const surname = fullName.substring(0, surnameLen);
        const givenName = fullName.substring(surnameLen);
        
        // 将名字部分拆分为单个字符
        const nameChars = givenName.split('');
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {/* 姓氏部分 - 不可点击，使用不同样式 */}
              <span 
                style={{ 
                  fontWeight: 'bold',
                  color: '#1890ff',
                  marginRight: '4px',
                  padding: '2px',
                  borderRadius: '3px',
                  backgroundColor: '#e6f7ff',
                  fontSize: '16px'
                }}
                title="姓氏（不可加入单字黑名单）"
              >
                {surname}
              </span>
              
              {/* 名字部分 - 可点击加入单字黑名单，长按加入单字喜欢名单 */}
              {nameChars.map((char, index) => (
                <span 
                  key={index} 
                  style={{ 
                    cursor: 'pointer',
                    marginRight: '2px',
                    padding: '2px',
                    borderRadius: '3px',
                    transition: 'background-color 0.2s',
                    fontSize: '16px'
                  }}
                  onClick={() => {
                    // 只有在未触发长按的情况下才执行点击事件
                    if (!isLongPressTriggered) {
                      addToCharBlacklist(char);
                    }
                    // 重置长按触发状态
                    setIsLongPressTriggered(false);
                  }}
                  onMouseDown={() => handleCharPressStart(char)}
                  onMouseUp={(e) => handleCharPressEnd(e)}
                  onMouseLeave={(e) => handleCharPressEnd(e)}
                  onTouchStart={() => handleCharPressStart(char)}
                  onTouchEnd={(e) => handleCharPressEnd(e)}
                  title={`点击将"${char}"加入单字黑名单，长按将"${char}"加入单字喜欢名单`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            <div>
              <Tooltip title="加入黑名单">
                <Button 
                  type="text" 
                  icon={<DislikeOutlined />} 
                  size="small"
                  onClick={() => addToBlacklist(givenName)}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
              <Tooltip title="加入喜欢名单">
                <Button 
                  type="text" 
                  icon={<LikeOutlined />} 
                  size="small"
                  onClick={() => addToLikelist(givenName)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            </div>
          </div>
        );
      }
    });
  }

  return (
    <div className="name-list-block">
      <div className="name-list">
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={handleAddToViewedList}
              disabled={nameList.length === 0}
            >
              添加当前页到已阅览名单
            </Button>
            <Button 
              type="default" 
              icon={<EyeInvisibleOutlined />}
              onClick={handleRemoveFromViewedList}
              disabled={nameList.length === 0}
            >
              取消添加当前页到已阅览名单
            </Button>
          </Space>
        </div>
        <Table
          size="small"
          dataSource={tableDataSource}
          columns={columns}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
            showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
        ></Table>
      </div>
    </div>
  );
};
