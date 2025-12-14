import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";
import { proxy, snapshot, useSnapshot } from "valtio";
import * as CommonType from "@/script/common/type";
import "./index.less";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import * as Util from "@/script/common/util";
import {
  List,
  Row,
  Col,
  Button,
  Input,
  Drawer,
  Divider,
  Card,
  Radio,
  message,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
  Tabs,
  Tooltip,
  Tag,
  Modal,
} from "antd";
import Desc from "./desc";
import Tip from "./component/tip";
import * as utils from "@src/utils";
import * as Type from "@src/resource/type";
import * as Const from "@src/resource/const";
import NameList from "@src/component/name_list";
import { saveAs } from "file-saver";
import VirtualList from "rc-virtual-list";

const default_char_level = utils.getValueByStorage<Type.CharDbLevel>(
  Const.Storage_Key_Map.Char_Level,
  Const.CharDb_Level_Option["标准字库"]
);

let default_input_姓氏 = utils.getValueByStorage<string>(
  Const.Storage_Key_Map.姓氏,
  "张"
);
let default_姓氏末字_拼音_choose =
  utils.getValueByStorage<CommonType.Char_With_Pinyin>(
    Const.Storage_Key_Map.姓氏末字_拼音_choose,
    {}
  );
let default_input_排除字列表 = utils.getValueByStorage<string>(
  Const.Storage_Key_Map.需过滤字列表,
  "玄德\n云长\n翼德\n备\n羽\n飞"
);
let default_input_必选字位置 = utils.getValueByStorage<Type.CharSpecifyPos>(
  Const.Storage_Key_Map.必选字位置,
  Const.Char_Specify_Option.不限制
);
let default_input_必选字 = utils.getValueByStorage<string>(
  Const.Storage_Key_Map.必选字,
  "亮\n云\n忠"
);
let default_gender_type = utils.getValueByStorage<Type.GenderType>(
  Const.Storage_Key_Map.Gender_Type,
  Const.Gender_Type.都看看
);
let default_是否乱序展示候选名 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.是否乱序展示候选名,
  true
);

let default_必选字不能同音 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.必选字不能同音,
  true
);

let default_音韵学检查开关 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵学检查开关,
  true
);

let default_当前候选字库 = utils.getValueByStorage<Type.ChooseType>(
  Const.Storage_Key_Map.当前候选字库,
  Const.Choose_Type_Option.古人云
);

let default_音韵_禁止同音 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵_禁止同音,
  true
);
let default_音韵_禁止同声调 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵_禁止同声调,
  true
);
let default_音韵_禁止同声母_方法 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵_禁止同声母_方法,
  true
);
let default_音韵_禁止同声母_部位 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵_禁止同声母_部位,
  true
);
let default_音韵_禁止同韵母 = utils.getValueByStorage<boolean>(
  Const.Storage_Key_Map.音韵_禁止同韵母,
  true
);

const store = proxy<{
  previewNameList: CommonType.Type_Name[];
  totalNameCount: number;
  maxDisplayItem: number;
  columnCount: number;
  status: {
    isLoading: boolean;
    currentTab: Type.ChooseType;
    currentCharDbLevel: Type.CharDbLevel;
    genderType: Type.GenderType;
    enableRandomNameList: boolean;
    enableFilterSamePinyinMustHaveChars: boolean;
    enablePhonologyCheck: boolean;
    phonologyChecks: {
      forbidSamePinyinWithoutTone: boolean;
      forbidSameTone: boolean;
      forbidSameInitialMethod: boolean;
      forbidSameInitialPlace: boolean;
      forbidSameVowelCategory: boolean;
    };
    generateConfig: {
      charSpecifyPos: Type.CharSpecifyPos;
      姓氏末字_拼音_choose: CommonType.Char_With_Pinyin;
    };
  };
}>({
  /**
   * 用于预览的姓名列表
   */
  previewNameList: [],
  /**
   * 总姓名数量
   */
  totalNameCount: 0,
  /**
   * 最大展示的姓名数
   */
  maxDisplayItem: 2000,
  /**
   * 每行展示x列
   */
  columnCount: 10,
  status: {
    isLoading: false,
    currentTab: default_当前候选字库 as Type.ChooseType,
    currentCharDbLevel: default_char_level,
    genderType: default_gender_type,
    enableRandomNameList: default_是否乱序展示候选名,
    enableFilterSamePinyinMustHaveChars: default_必选字不能同音,
    enablePhonologyCheck: default_音韵学检查开关,
    phonologyChecks: {
      forbidSamePinyinWithoutTone: default_音韵_禁止同音,
      forbidSameTone: default_音韵_禁止同声调,
      forbidSameInitialMethod: default_音韵_禁止同声母_方法,
      forbidSameInitialPlace: default_音韵_禁止同声母_部位,
      forbidSameVowelCategory: default_音韵_禁止同韵母,
    },
    generateConfig: {
      charSpecifyPos: default_input_必选字位置,
      姓氏末字_拼音_choose: default_姓氏末字_拼音_choose,
    },
  },
});

export default () => {
  try {
    const start = (window as any).__appStart ?? performance.timeOrigin ?? performance.now();
    console.log(`[启动日志] 模块到组件执行耗时: ${(performance.now() - start).toFixed(1)}ms`);
    setTimeout(() => {
      console.log(`[启动日志] 首次宏任务空闲时间: ${(performance.now() - start).toFixed(1)}ms`);
    }, 0);
    if ((window as any).requestIdleCallback) {
      (window as any).requestIdleCallback(() => {
        console.log(`[启动日志] 首次 requestIdleCallback 时间: ${(performance.now() - start).toFixed(1)}ms`);
      });
    }
  } catch {}
  let snapshot = useSnapshot(store);
  let [input_姓氏, set_input_姓氏] = useState<string>(default_input_姓氏);
  let [input_排除字列表, set_input_排除字列表] =
    useState<string>(default_input_排除字列表);
  let [input_必选字, set_input_必选字] = useState<string>(default_input_必选字);
  let [totalNameList, setTotalNameList] = useState<CommonType.Type_Name[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [blacklist, setBlacklist] = useState<string[]>(() => {
    const savedBlacklist = localStorage.getItem('nameBlacklist');
    return savedBlacklist ? JSON.parse(savedBlacklist) : [];
  });
  const [likelist, setLikelist] = useState<string[]>(() => {
    const savedLikelist = localStorage.getItem('nameLikelist');
    return savedLikelist ? JSON.parse(savedLikelist) : [];
  });
  const [charBlacklist, setCharBlacklist] = useState<string[]>(() => {
    const savedCharBlacklist = localStorage.getItem('charBlacklist');
    return savedCharBlacklist ? JSON.parse(savedCharBlacklist) : [];
  });
  const [charLikelist, setCharLikelist] = useState<string[]>(() => {
    const savedCharLikelist = localStorage.getItem('charLikelist');
    return savedCharLikelist ? JSON.parse(savedCharLikelist) : [];
  });
  const [viewedList, setViewedList] = useState<string[]>(() => {
    const savedViewedList = localStorage.getItem('nameViewedList');
    return savedViewedList ? JSON.parse(savedViewedList) : [];
  });
  const [customNameList, setCustomNameList] = useState<string[]>(() => {
    const saved = utils.getValueByStorage<string>(Const.Storage_Key_Map.自定义名字库, "[]");
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isBlacklistModalOpen, setBlacklistModalOpen] = useState(false);
  const [isLikelistModalOpen, setLikelistModalOpen] = useState(false);
  const [isCharBlacklistModalOpen, setCharBlacklistModalOpen] = useState(false);
  const [isViewedListModalOpen, setViewedListModalOpen] = useState(false);
  const [isCustomNameModalOpen, setCustomNameModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState<string>("");
  const [docContent, setDocContent] = useState<string>("");

  const MODAL_VLIST_HEIGHT = 400;
  const MODAL_VLIST_ITEM_HEIGHT = 40;

  const renderVirtualTagList = (params: {
    items: string[];
    color: string;
    prefix?: string;
    tagsPerRow: number;
    emptyText: string;
    itemKeyPrefix: string;
    onCloseItem: (value: string) => void;
  }) => {
    const {
      items,
      color,
      prefix,
      tagsPerRow,
      emptyText,
      itemKeyPrefix,
      onCloseItem,
    } = params;

    if (!items || items.length === 0) {
      return <span style={{ color: "#999" }}>{emptyText}</span>;
    }

    const rows: { key: string; items: string[] }[] = [];
    for (let i = 0; i < items.length; i += tagsPerRow) {
      rows.push({
        key: `${itemKeyPrefix}-row-${i / tagsPerRow}`,
        items: items.slice(i, i + tagsPerRow),
      });
    }

    return (
      <div style={{ maxHeight: MODAL_VLIST_HEIGHT, overflow: "hidden" }}>
        <VirtualList
          data={rows}
          height={MODAL_VLIST_HEIGHT}
          itemHeight={MODAL_VLIST_ITEM_HEIGHT}
          itemKey={(row) => row.key}
        >
          {(row) => (
            <div
              style={{
                height: MODAL_VLIST_ITEM_HEIGHT,
                display: "flex",
                alignItems: "center",
                padding: "0 4px",
                gap: 8,
              }}
            >
              {row.items.map((value) => (
                <Tag
                  key={`${row.key}-${value}`}
                  color={color}
                  closable
                  onClose={() => onCloseItem(value)}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                  >
                    {prefix}
                    {value}
                  </span>
                </Tag>
              ))}
            </div>
          )}
        </VirtualList>
      </div>
    );
  };
  let str_姓氏 = utils.removeUnChineseChar(input_姓氏);
  let str_必选字 = utils.removeUnChineseChar(input_必选字);
  let str_排除字列表 = utils.removeUnChineseChar(input_排除字列表);
  const char_姓_末尾字 = str_姓氏.split("").pop() ?? "";
  const char_姓_末尾字_PinyinList = utils.getPinyinOfChar(char_姓_末尾字);
  let pinyin_of_姓_末尾字 = char_姓_末尾字_PinyinList[0];

  const const_col_标题_span = 4;
  const const_col_输入框_span = 20;
  const MAX_TAG_PREVIEW = 50;

  let flag姓氏最后一字是否为多音字 = char_姓_末尾字_PinyinList.length > 1;
  let flag已确认姓氏最后一字发音 = true;
  if (flag姓氏最后一字是否为多音字) {
    if (
      snapshot.status.generateConfig.姓氏末字_拼音_choose.char !==
      char_姓_末尾字
    ) {
      flag已确认姓氏最后一字发音 = false;
    } else {
      // 若之前已配置过, 则使用配置的发音
      pinyin_of_姓_末尾字 = snapshot.status.generateConfig.姓氏末字_拼音_choose;
    }
  }

  let ele_选择末尾字发音 = <div></div>;
  if (flag姓氏最后一字是否为多音字) {
    ele_选择末尾字发音 = (
      <div style={{ marginTop: '8px', minHeight: '0px' }}>
        <Row align="middle">
          <Col span={const_col_标题_span}></Col>
          <Col span={const_col_输入框_span - const_col_标题_span}>
            {char_姓_末尾字}为多音字, 请选择其读音&nbsp;&nbsp;
            <Radio.Group
              defaultValue={
                snapshot.status.generateConfig.姓氏末字_拼音_choose.pinyin
              }
              onChange={(event) => {
                let choosePinyin原始值 = event.target.value;
                let choose拼音配置 = char_姓_末尾字_PinyinList.filter((item) => {
                  return item.pinyin === choosePinyin原始值;
                })[0];
                store.status.generateConfig.姓氏末字_拼音_choose = choose拼音配置;
                utils.setValueByStorage(
                  Const.Storage_Key_Map.姓氏末字_拼音_choose,
                  choose拼音配置
                );
                Tools.reset();
              }}
            >
              {char_姓_末尾字_PinyinList.map((item) => {
                return (
                  <Radio.Button key={item.pinyin} value={item.pinyin}>
                    {item.pinyin}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Col>
        </Row>
      </div>
    );
  }

  const char_姓_全部 = str_姓氏.split("").map((char) => {
    return utils.transString2PinyinList(char)[0];
  });

  const char_必选字_list = utils.transString2PinyinList(str_必选字);
  const char_排除字_list = utils.transString2PinyinList(str_排除字列表);

  // 根据汉字级别, 设定所使用的选项集
  let pinyinOptionList =
    Const.CharDb_Level_Item[snapshot.status.currentCharDbLevel];

  const showDrawer = () => {
    open(
      "https://github.com/YaoZeyuan/name-generator/blob/master/README.md",
      "_blank"
    );
    // setIsOpen(true);
  };

  // 更新黑名单状态
  const updateBlacklist = (newBlacklist: string[]) => {
    setBlacklist(newBlacklist);
    localStorage.setItem('nameBlacklist', JSON.stringify(newBlacklist));
  };

  // 更新喜欢名单状态
  const updateLikelist = (newLikelist: string[]) => {
    setLikelist(newLikelist);
    localStorage.setItem('nameLikelist', JSON.stringify(newLikelist));
  };

  // 更新单字黑名单状态
  const updateCharBlacklist = (newCharBlacklist: string[]) => {
    setCharBlacklist(newCharBlacklist);
    localStorage.setItem('charBlacklist', JSON.stringify(newCharBlacklist));
  };

  // 更新单字喜欢名单状态
  const updateCharLikelist = (newCharLikelist: string[]) => {
    setCharLikelist(newCharLikelist);
    localStorage.setItem('charLikelist', JSON.stringify(newCharLikelist));
  };

  const updateViewedList = (newViewedList: string[]) => {
    setViewedList(newViewedList);
    localStorage.setItem('nameViewedList', JSON.stringify(newViewedList));
  };

  const updateCustomNameList = (newList: string[]) => {
    const uniq = Array.from(new Set(newList)).filter(Boolean);
    setCustomNameList(uniq);
    utils.setValueByStorage(Const.Storage_Key_Map.自定义名字库, JSON.stringify(uniq));
  };

  const importCustomNameList = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.csv,.md,.log,text/plain';

    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = String(e.target?.result ?? "");
          const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

          // 去掉姓氏：优先按“当前姓氏”前缀移除；否则按常见 3/4 字全名截取后两字
          const surnameStr = utils.removeUnChineseChar(input_姓氏);

          const imported: string[] = [];
          let skipped = 0;
          for (const line of lines) {
            const onlyChinese = utils.removeUnChineseChar(line);
            if (!onlyChinese) {
              skipped++;
              continue;
            }

            let givenName = "";
            if (surnameStr && onlyChinese.startsWith(surnameStr) && onlyChinese.length >= surnameStr.length + 2) {
              const rest = onlyChinese.slice(surnameStr.length);
              if (rest.length === 2) {
                givenName = rest;
              } else {
                // 兜底：取最后两个字
                givenName = rest.slice(-2);
              }
            } else if (onlyChinese.length === 2) {
              givenName = onlyChinese;
            } else if (onlyChinese.length === 3) {
              givenName = onlyChinese.slice(1);
            } else if (onlyChinese.length === 4) {
              givenName = onlyChinese.slice(2);
            } else {
              skipped++;
              continue;
            }

            if (givenName.length !== 2) {
              skipped++;
              continue;
            }
            imported.push(givenName);
          }

          const merged = Array.from(new Set([...(customNameList || []), ...imported]));
          updateCustomNameList(merged);
          message.success(`自定义名字库导入完成：新增 ${new Set(imported).size} 条，跳过 ${skipped} 条`);
        } catch (err) {
          message.error('导入失败，请检查文件内容');
          console.error('自定义名字库导入失败:', err);
        }
      };

      reader.readAsText(file);
    };

    fileInput.click();
  };

  // 添加当前页所有姓名到已阅览名单
  const addCurrentPageToViewedList = (currentPageNames: string[]) => {
    const newViewedList = [...new Set([...viewedList, ...currentPageNames])]; // 去重
    updateViewedList(newViewedList);
    message.success(`已将当前页的 ${currentPageNames.length} 个姓名加入已阅览名单`);
  };

  // 取消添加当前页所有姓名到已阅览名单
  const removeCurrentPageFromViewedList = (currentPageNames: string[]) => {
    const newViewedList = viewedList.filter(name => !currentPageNames.includes(name));
    updateViewedList(newViewedList);
    message.success(`已将当前页的 ${currentPageNames.length} 个姓名从已阅览名单中移除`);
  };

  // 导出配置功能
  const exportConfig = () => {
    // 收集所有配置项
    const config = {
      // 基本配置
      surname: input_姓氏,
      excludeChars: input_排除字列表,
      mustHaveChars: input_必选字,
      mustHaveCharsPosition: snapshot.status.generateConfig.charSpecifyPos,
      charDbLevel: snapshot.status.currentCharDbLevel,
      genderType: snapshot.status.genderType,
      enableRandomNameList: snapshot.status.enableRandomNameList,
      enablePhonologyCheck: snapshot.status.enablePhonologyCheck,
      phonologyChecks: snapshot.status.phonologyChecks,
      currentTab: snapshot.status.currentTab,
      
      // 黑名单、喜欢名单和已阅览名单（导出时忽略姓氏）
      blacklist: blacklist,
      likelist: likelist,
      charBlacklist: charBlacklist,
      charLikelist: charLikelist,
      viewedList: viewedList,
      
      // 姓氏末字拼音选择（如果有多音字）
      surnameLastCharPinyin: snapshot.status.generateConfig.姓氏末字_拼音_choose,
    };
    
    // 转换为JSON字符串
    const configJson = JSON.stringify(config, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([configJson], { type: 'application/json' });
    
    // 下载文件
    saveAs(blob, '姓名生成器配置.json');
    
    message.success('配置导出成功');
  };

  // 导入配置功能
  const importConfig = () => {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // 监听文件选择事件
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 解析JSON
          const config = JSON.parse(e.target?.result as string);
          
          // 应用配置
          // Ignore surname when importing configuration
        // if (config.surname !== undefined) {
        //   set_input_姓氏(config.surname);
        //   utils.setValueByStorage(Const.Storage_Key_Map.姓氏, config.surname);
        // }
          
          if (config.excludeChars !== undefined) {
            set_input_排除字列表(config.excludeChars);
            utils.setValueByStorage(Const.Storage_Key_Map.需过滤字列表, config.excludeChars);
          }
          
          if (config.mustHaveChars !== undefined) {
            set_input_必选字(config.mustHaveChars);
            utils.setValueByStorage(Const.Storage_Key_Map.必选字, config.mustHaveChars);
          }
          
          if (config.mustHaveCharsPosition !== undefined) {
            store.status.generateConfig.charSpecifyPos = config.mustHaveCharsPosition;
            utils.setValueByStorage(Const.Storage_Key_Map.必选字位置, config.mustHaveCharsPosition);
          }
          
          if (config.charDbLevel !== undefined) {
            store.status.currentCharDbLevel = config.charDbLevel;
            utils.setValueByStorage(Const.Storage_Key_Map.Char_Level, config.charDbLevel);
          }
          
          if (config.genderType !== undefined) {
            store.status.genderType = config.genderType;
            utils.setValueByStorage(Const.Storage_Key_Map.Gender_Type, config.genderType);
          }
          
          if (config.enableRandomNameList !== undefined) {
            store.status.enableRandomNameList = config.enableRandomNameList;
            utils.setValueByStorage(Const.Storage_Key_Map.是否乱序展示候选名, config.enableRandomNameList);
          }
          if (config.enablePhonologyCheck !== undefined) {
            store.status.enablePhonologyCheck = config.enablePhonologyCheck;
            utils.setValueByStorage(Const.Storage_Key_Map.音韵学检查开关, config.enablePhonologyCheck);
          }
          if (config.phonologyChecks !== undefined) {
            const c = config.phonologyChecks || {};
            if (typeof c.forbidSamePinyinWithoutTone === 'boolean') {
              store.status.phonologyChecks.forbidSamePinyinWithoutTone = c.forbidSamePinyinWithoutTone;
              utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同音, c.forbidSamePinyinWithoutTone);
            }
            if (typeof c.forbidSameTone === 'boolean') {
              store.status.phonologyChecks.forbidSameTone = c.forbidSameTone;
              utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声调, c.forbidSameTone);
            }
            if (typeof c.forbidSameInitialMethod === 'boolean') {
              store.status.phonologyChecks.forbidSameInitialMethod = c.forbidSameInitialMethod;
              utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声母_方法, c.forbidSameInitialMethod);
            }
            if (typeof c.forbidSameInitialPlace === 'boolean') {
              store.status.phonologyChecks.forbidSameInitialPlace = c.forbidSameInitialPlace;
              utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声母_部位, c.forbidSameInitialPlace);
            }
            if (typeof c.forbidSameVowelCategory === 'boolean') {
              store.status.phonologyChecks.forbidSameVowelCategory = c.forbidSameVowelCategory;
              utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同韵母, c.forbidSameVowelCategory);
            }
          }
          
          if (config.currentTab !== undefined) {
            store.status.currentTab = config.currentTab;
          }
          
          if (config.blacklist !== undefined) {
            updateBlacklist(config.blacklist);
          }
          
          if (config.likelist !== undefined) {
            updateLikelist(config.likelist);
          }
          
          if (config.charBlacklist !== undefined) {
            updateCharBlacklist(config.charBlacklist);
          }
          
          if (config.charLikelist !== undefined) {
            updateCharLikelist(config.charLikelist);
          }
          
          if (config.viewedList !== undefined) {
            updateViewedList(config.viewedList);
          }
          
          if (config.surnameLastCharPinyin !== undefined) {
            store.status.generateConfig.姓氏末字_拼音_choose = config.surnameLastCharPinyin;
            utils.setValueByStorage(Const.Storage_Key_Map.姓氏末字_拼音_choose, config.surnameLastCharPinyin);
          }
          
          message.success('配置导入成功');
        } catch (error) {
          message.error('配置导入失败，请检查文件格式');
          console.error('配置导入失败:', error);
        }
      };
      
      // 读取文件
      reader.readAsText(file);
    };
    
    // 触发文件选择
    fileInput.click();
  };

  const onClose = () => {
    setIsOpen(false);
  };

  // 重置所有配置
  const resetAllConfig = () => {
    // 清除所有localStorage中的配置
    localStorage.removeItem('nameBlacklist');
    localStorage.removeItem('nameLikelist');
    localStorage.removeItem('charBlacklist');
    localStorage.removeItem('charLikelist');
    localStorage.removeItem('nameViewedList');
    localStorage.removeItem(Const.Storage_Key_Map.姓氏);
    localStorage.removeItem(Const.Storage_Key_Map.需过滤字列表);
    localStorage.removeItem(Const.Storage_Key_Map.必选字);
    localStorage.removeItem(Const.Storage_Key_Map.必选字位置);
    localStorage.removeItem(Const.Storage_Key_Map.姓氏末字_拼音_choose);
    localStorage.removeItem(Const.Storage_Key_Map.Gender_Type);
    localStorage.removeItem(Const.Storage_Key_Map.是否乱序展示候选名);
    localStorage.removeItem(Const.Storage_Key_Map.当前候选字库);
    localStorage.removeItem(Const.Storage_Key_Map.Char_Level);
    localStorage.removeItem(Const.Storage_Key_Map.音韵学检查开关);
    localStorage.removeItem(Const.Storage_Key_Map.音韵_禁止同音);
    localStorage.removeItem(Const.Storage_Key_Map.音韵_禁止同声调);
    localStorage.removeItem(Const.Storage_Key_Map.音韵_禁止同声母_方法);
    localStorage.removeItem(Const.Storage_Key_Map.音韵_禁止同声母_部位);
    localStorage.removeItem(Const.Storage_Key_Map.音韵_禁止同韵母);
    
    // 重置状态
    setBlacklist([]);
    setLikelist([]);
    setCharBlacklist([]);
    setCharLikelist([]);
    setViewedList([]);
    set_input_姓氏("张");
    set_input_排除字列表("玄德\n云长\n翼德\n备\n羽\n飞");
    set_input_必选字("亮\n云\n忠");
    
    // 重置store状态
    store.status.currentTab = Const.Choose_Type_Option.古人云;
    store.status.currentCharDbLevel = Const.CharDb_Level_Option["标准字库"];
    store.status.genderType = Const.Gender_Type.都看看;
    store.status.enableRandomNameList = true;
    store.status.generateConfig.charSpecifyPos = Const.Char_Specify_Option.不限制;
    store.status.generateConfig.姓氏末字_拼音_choose = {} as CommonType.Char_With_Pinyin;
    store.status.enablePhonologyCheck = true;
    store.status.phonologyChecks = {
      forbidSamePinyinWithoutTone: true,
      forbidSameTone: true,
      forbidSameInitialMethod: true,
      forbidSameInitialPlace: true,
      forbidSameVowelCategory: true,
    };
    
    // 关闭弹窗并刷新页面
    setIsResetModalOpen(false);
    message.success('所有配置已重置，即将刷新页面');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // 显示重置确认弹窗
  const showResetModal = () => {
    setIsResetModalOpen(true);
  };

  // 取消重置
  const cancelReset = () => {
    setIsResetModalOpen(false);
  };
  const Tools = {
    reset: () => {
      store.status.isLoading = false;
      store.previewNameList = [];
      setTotalNameList([]);
    },
  };

  const openDoc = async (path: string, title: string) => {
    try {
      const res = await fetch(path);
      const text = await res.text();
      setDocTitle(title);
      setDocContent(text);
      setDocModalOpen(true);
    } catch (e) {
      message.error("文档加载失败");
    }
  };

  let isIn诗云Tab =
    snapshot.status.currentTab === Const.Choose_Type_Option["诗云-所有可能"] ||
    snapshot.status.currentTab === Const.Choose_Type_Option["诗云-按发音合并"];

  let ele诗云字库 = <div></div>;
  if (isIn诗云Tab) {
    ele诗云字库 = (
      <div>
        <div>
          <Space>
            <span>候选字库</span>
            <Select
              dropdownMatchSelectWidth={false}
              style={{ width: "100%" }}
              value={snapshot.status.currentCharDbLevel}
              onChange={(value: Type.CharDbLevel) => {
                store.status.currentCharDbLevel = value;
                utils.setValueByStorage(
                  Const.Storage_Key_Map.Char_Level,
                  value
                );
                Tools.reset();
              }}
            >
              <Select.Option value={Const.CharDb_Level_Option.标准字库}>
                {Const.CharDb_Level_Show[Const.CharDb_Level_Option.标准字库]}
              </Select.Option>
              <Select.Option value={Const.CharDb_Level_Option.至少出现100次}>
                {
                  Const.CharDb_Level_Show[
                    Const.CharDb_Level_Option.至少出现100次
                  ]
                }
              </Select.Option>
              <Select.Option value={Const.CharDb_Level_Option.至少出现50次}>
                {
                  Const.CharDb_Level_Show[
                    Const.CharDb_Level_Option.至少出现50次
                  ]
                }
              </Select.Option>
              <Select.Option value={Const.CharDb_Level_Option.至少出现10次}>
                {
                  Const.CharDb_Level_Show[
                    Const.CharDb_Level_Option.至少出现10次
                  ]
                }
              </Select.Option>
              <Select.Option value={Const.CharDb_Level_Option.至少出现5次}>
                {Const.CharDb_Level_Show[Const.CharDb_Level_Option.至少出现5次]}
              </Select.Option>
              <Select.Option value={Const.CharDb_Level_Option.至少出现1次}>
                {Const.CharDb_Level_Show[Const.CharDb_Level_Option.至少出现1次]}
              </Select.Option>
            </Select>
          </Space>
        </div>
        <p></p>
      </div>
    );
  }

  let tip = "";
  if (snapshot.previewNameList.length > 0) {
    tip = `, 共有${totalNameList.length}种候选方案`;
    if (totalNameList.length > snapshot.previewNameList.length) {
      tip = `${tip}, 展示前${snapshot.maxDisplayItem}个, 每行展示${snapshot.columnCount}个`;
    }
  }

  const listConfigList: {
    title: string;
    description: string;
    comment: string;
    optionCount: number;
  }[] = [];
  for (let key of [
    Const.Choose_Type_Option.登科录,
    Const.Choose_Type_Option.古人云,
    Const.Choose_Type_Option["五道口-精选集"],
    Const.Choose_Type_Option["五道口-集思录"],
    Const.Choose_Type_Option.他山石,
    Const.Choose_Type_Option["财富论-精选集"],
    Const.Choose_Type_Option["财富论-集思录"],
    Const.Choose_Type_Option["诗云-按发音合并"],
    Const.Choose_Type_Option["诗云-所有可能"],
    Const.Choose_Type_Option["单字随机重组"],
    Const.Choose_Type_Option["自定义名字库"],
  ]) {
    listConfigList.push({
      title: key,
      description: Const.Choose_Type_Desc[key].desc,
      comment: Const.Choose_Type_Desc[key].comment,
      optionCount:
        key === Const.Choose_Type_Option["自定义名字库"]
          ? customNameList.length
          : Const.Choose_Type_Desc[key].optionCount,
    });
  }

  const blacklistPreview = blacklist.slice(0, MAX_TAG_PREVIEW);
  const blacklistHasMore = blacklist.length > MAX_TAG_PREVIEW;
  const likelistPreview = likelist.slice(0, MAX_TAG_PREVIEW);
  const likelistHasMore = likelist.length > MAX_TAG_PREVIEW;
  const charBlacklistPreview = charBlacklist.slice(0, MAX_TAG_PREVIEW);
  const charBlacklistHasMore = charBlacklist.length > MAX_TAG_PREVIEW;
  const viewedPreview = viewedList.slice(0, MAX_TAG_PREVIEW);
  const viewedHasMore = viewedList.length > MAX_TAG_PREVIEW;

  return (
    <div className="root-9969b06-block">
      <Row align="middle">
        <Col span={const_col_标题_span}>
          <span>请输入姓氏</span>
        </Col>
        <Col span={const_col_输入框_span}>
          <Input
            value={input_姓氏}
            style={{ width: '200px' }}
            onChange={(e) => {
              let inputValue = e.target.value;
              inputValue = inputValue.trim();
              utils.setValueByStorage(Const.Storage_Key_Map.姓氏, inputValue);
              set_input_姓氏(inputValue);
            }}
            onBlur={(e) => {
              let inputValue = e.target.value;
              inputValue = inputValue.trim();
              const oldSurname = input_姓氏;
              
              // 如果姓氏发生变化，刷新黑名单、喜欢名单和已阅览名单
              if (oldSurname !== inputValue) {
                message.info(`姓氏已从"${oldSurname}"变更为"${inputValue}"，名单已刷新`);
                // 重新生成候选名
                document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
              }
            }}
          ></Input>
        </Col>
      </Row>
      {ele_选择末尾字发音}
      <Divider
        style={{
          margin: "12px 0px",
        }}
      ></Divider>
      <Row align="middle">
        <Col span={const_col_标题_span}>
          <p>需要避开的同音字(如父母姓名/亲属姓名)</p>
        </Col>
        <Col span={const_col_输入框_span}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Input
              placeholder="输入同音字后按回车添加"
              style={{ width: '200px' }}
              onPressEnter={(e) => {
                const input = e.target as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  // 过滤掉非汉字的输入
                  if (!Util.is汉字String(value)) {
                    message.error('请输入汉字');
                    return;
                  }
                  const currentList = input_排除字列表 ? input_排除字列表.split('\n').filter(item => item.trim()) : [];
                  if (!currentList.includes(value)) {
                    const newList = [...currentList, value].join('\n');
                    utils.setValueByStorage(
                      Const.Storage_Key_Map.需过滤字列表,
                      newList
                    );
                    set_input_排除字列表(newList);
                  }
                  input.value = '';
                }
              }}
            />
            <Button 
              size="small" 
              danger
              style={{ marginLeft: '8px' }}
              onClick={() => {
                utils.setValueByStorage(
                  Const.Storage_Key_Map.需过滤字列表,
                  ''
                );
                set_input_排除字列表('');
                message.success('同音字列表已清空');
              }}
            >
              清空
            </Button>
          </div>
        </Col>
      </Row>
      <Row align="middle">
        <Col span={const_col_标题_span}></Col>
        <Col span={const_col_输入框_span}>
          <div style={{ marginTop: '0px', minHeight: '0px' }}>
            {input_排除字列表 ? input_排除字列表.split('\n').filter(item => item.trim()).map((word, index) => (
              <Tag 
                key={`${word}-${index}`} 
                color="red" 
                closable
                onClose={() => {
                  const currentList = input_排除字列表.split('\n').filter(item => item.trim());
                  const newList = currentList.filter(item => item !== word).join('\n');
                  utils.setValueByStorage(
                    Const.Storage_Key_Map.需过滤字列表,
                    newList
                  );
                  set_input_排除字列表(newList);
                }}
              >
                {word}
              </Tag>
            )) : null}
          </div>
        </Col>
      </Row>
      <Divider
        style={{
          margin: "12px 0px",
        }}
      ></Divider>
      <Row align="middle">
        <Col span={const_col_标题_span}>
          <span>指定用字&出现位置(可不填)</span>
        </Col>
        <Col span={const_col_输入框_span}>
          <Radio.Group
            defaultValue={snapshot.status.generateConfig.charSpecifyPos}
            onChange={(event) => {
              store.status.generateConfig.charSpecifyPos = event.target.value;
              utils.setValueByStorage(
                Const.Storage_Key_Map.必选字位置,
                event.target.value
              );
              Tools.reset();
            }}
          >
            <Radio.Button value={Const.Char_Specify_Option.第二位}>
              {Const.Char_Specify_Option.第二位}
              <Tip title="若在第二位指定候选字,则跳过对姓氏+第二位候选字的音韵检查逻辑,直接生成结果"></Tip>
            </Radio.Button>
            <Radio.Button value={Const.Char_Specify_Option.第三位}>
              {Const.Char_Specify_Option.第三位}
            </Radio.Button>
            <Radio.Button value={Const.Char_Specify_Option.不限制}>
              {Const.Char_Specify_Option.不限制}
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <p></p>
      <Row align="middle">
        <Col span={const_col_标题_span}></Col>
        <Col span={const_col_输入框_span}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>必选字不能同音:</span>
            <Switch
              checked={snapshot.status.enableFilterSamePinyinMustHaveChars}
              onChange={(checked) => {
                store.status.enableFilterSamePinyinMustHaveChars = checked;
                utils.setValueByStorage(
                  Const.Storage_Key_Map.必选字不能同音,
                  checked
                );
                Tools.reset();
              }}
            />
            <Tip title="开启后，若必选字同音，则只保留第一个必选字；关闭后，允许多个同音必选字同时存在"></Tip>
          </div>
        </Col>
      </Row>
      <p></p>
      <Row align="middle">
        <Col span={const_col_标题_span}></Col>
        <Col span={const_col_输入框_span}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Input
              placeholder="输入指定用字后按回车添加"
              style={{ width: '200px' }}
              onPressEnter={(e) => {
                const input = e.target as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  // 过滤掉非汉字的输入
                  if (!Util.is汉字String(value)) {
                    message.error('请输入汉字');
                    return;
                  }
                  // 将输入的字符串拆分成单个字符
                  const chars = value.split('');
                  const currentList = input_必选字 ? input_必选字.split('\n').filter(item => item.trim()) : [];
                  
                  // 添加新字符，避免重复
                  const newList = [...currentList];
                  chars.forEach(char => {
                    if (char.trim() && !newList.includes(char)) {
                      newList.push(char);
                    }
                  });
                  
                  utils.setValueByStorage(Const.Storage_Key_Map.必选字, newList.join('\n'));
                  set_input_必选字(newList.join('\n'));
                  input.value = '';
                }
              }}
            />
            <Button 
              size="small" 
              danger
              style={{ marginLeft: '8px' }}
              onClick={() => {
                Modal.confirm({
                  title: '确认清空指定用字？',
                  content: '清空后不可恢复',
                  okText: '确认清空',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => {
                    utils.setValueByStorage(Const.Storage_Key_Map.必选字, '');
                    set_input_必选字('');
                    message.success('指定用字列表已清空');
                  },
                });
              }}
            >
              清空
            </Button>
          </div>
          <div style={{ marginTop: '8px', minHeight: '0px' }}>
            {input_必选字 ? input_必选字.split('\n').filter(item => item.trim()).map((word, index) => (
              <Tag 
                key={`${word}-${index}`} 
                color="green" 
                closable
                onClose={() => {
                  const currentList = input_必选字.split('\n').filter(item => item.trim());
                  const newList = currentList.filter(item => item !== word).join('\n');
                  utils.setValueByStorage(Const.Storage_Key_Map.必选字, newList);
                  set_input_必选字(newList);
                }}
              >
                {word}
              </Tag>
            )) : null}
          </div>
        </Col>
      </Row>
      <Divider
        style={{
          margin: "12px 0px",
        }}
      ></Divider>
      <Row align="middle">
        <Col span={const_col_标题_span}>
          <span>音韵学检查</span>
          {(() => {
            const tipContent = (
              <div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  <li>
                    禁止与指定汉字同音
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>避免与长辈/亲属名字中的字符同音</li>
                    </ul>
                  </li>
                  <li>
                    禁止叠双声声
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>
                        连续两字声母所属分类相同, 例如 <code>d/t/n/l</code> 同属舌尖中音, 一次性念出 <code>电梯内到他那里动态能力的童年</code> 会非常困难
                      </li>
                    </ul>
                  </li>
                  <li>
                    禁止叠韵
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>
                        连续两字韵母所属分类相同, 例如 <code>喇嘛拿喇叭拉哑巴换挞嘛</code> —— 该规则一般用于编写绕口令
                      </li>
                    </ul>
                  </li>
                  <li>
                    音调平仄
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>
                        三字名的音调平仄一共有 64 种不同情况, 从音韵美感评级上可分为 1~5 分, 诗云中仅提供评分为 3 分以上的组合
                      </li>
                      <li>支持按男宝女宝选名</li>
                      <li>男宝结尾名一般选二声(阳平)或四声(去声), 比较响亮, 干脆利落</li>
                      <li>女宝结尾名一般选一声(阴平), 比较温和</li>
                      <li>三声(上声)结尾, 男宝女宝均可用</li>
                    </ul>
                  </li>
                  <li>
                    避免多音字
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>姓名中需要绕开多音字, 以避免被喊错名字</li>
                      <li>
                        诗云中对 100 万+姓名进行解析, 除了姓名中明确作为单音字使用的 <code>多音字</code> 外(如 <code>华/中/大/正/和</code>), 其他多音字均已从候选字库排除。具体规则见
                        <a href="#" onClick={(e) => { e.preventDefault(); openDoc('/doc/多音字取音标准.md', '多音字取音标准'); }}>多音字取音标准</a>
                      </li>
                      <li>若姓氏本身是多音字(如 任), 需要指定发音后方可继续使用</li>
                    </ul>
                  </li>
                </ul>
              </div>
            );
            return <Tip title={tipContent as any} />;
          })()}
        </Col>
        <Col span={const_col_输入框_span}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span>总开关:</span>
            <Switch
              checked={snapshot.status.enablePhonologyCheck}
              onChange={(checked) => {
                store.status.enablePhonologyCheck = checked;
                utils.setValueByStorage(Const.Storage_Key_Map.音韵学检查开关, checked);
                Tools.reset();
              }}
            />
            <Tip title="开启后按音韵规则过滤：相邻两字不允许同音（忽略声调）、不允许同声调、声母类别（发音方法/发音部位）不能相同、韵母类别不能相同；在全名模式下还对第2、3字执行同样检查；当第二位指定候选字时，仅检查后两字搭配。关闭后将跳过音韵检查，生成更多候选，速度更快"></Tip>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
            <div>
              <span style={{ marginRight: '8px' }}>禁止同音(忽略声调):</span>
              <Switch
                checked={snapshot.status.phonologyChecks.forbidSamePinyinWithoutTone}
                onChange={(checked) => {
                  store.status.phonologyChecks.forbidSamePinyinWithoutTone = checked;
                  utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同音, checked);
                  Tools.reset();
                }}
                disabled={!snapshot.status.enablePhonologyCheck}
              />
              <Tip title="相邻两字拼音去声调后相同将过滤。例：清青（qing, qing）、安胺（an, an）"></Tip>
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>禁止同声调:</span>
              <Switch
                checked={snapshot.status.phonologyChecks.forbidSameTone}
                onChange={(checked) => {
                  store.status.phonologyChecks.forbidSameTone = checked;
                  utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声调, checked);
                  Tools.reset();
                }}
                disabled={!snapshot.status.enablePhonologyCheck}
              />
              <Tip title="相邻两字声调相同将过滤。例：明灵（míng、líng，均二声）、安康（ān、kāng，均一声）"></Tip>
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>禁止同声母(发音方法):</span>
              <Switch
                checked={snapshot.status.phonologyChecks.forbidSameInitialMethod}
                onChange={(checked) => {
                  store.status.phonologyChecks.forbidSameInitialMethod = checked;
                  utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声母_方法, checked);
                  Tools.reset();
                }}
                disabled={!snapshot.status.enablePhonologyCheck}
              />
              <Tip title="相邻两字声母发音方法相同将过滤（如都为塞音/擦音）。例：博德（b、d，均为塞音）"></Tip>
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>禁止同声母(发音部位):</span>
              <Switch
                checked={snapshot.status.phonologyChecks.forbidSameInitialPlace}
                onChange={(checked) => {
                  store.status.phonologyChecks.forbidSameInitialPlace = checked;
                  utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同声母_部位, checked);
                  Tools.reset();
                }}
                disabled={!snapshot.status.enablePhonologyCheck}
              />
              <Tip title="相邻两字声母发音部位相同将过滤（如都为唇音/舌尖音）。例：博朋（b、p，均为唇音）"></Tip>
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>禁止同韵母:</span>
              <Switch
                checked={snapshot.status.phonologyChecks.forbidSameVowelCategory}
                onChange={(checked) => {
                  store.status.phonologyChecks.forbidSameVowelCategory = checked;
                  utils.setValueByStorage(Const.Storage_Key_Map.音韵_禁止同韵母, checked);
                  Tools.reset();
                }}
                disabled={!snapshot.status.enablePhonologyCheck}
              />
              <Tip title="相邻两字韵母类别相同将过滤。例：张当（zhāng、dāng，韵母均为 ang）"></Tip>
            </div>
          </div>
          <div>
            <span>按音韵过滤姓名:&nbsp;</span>
        <Radio.Group
          className="compact-radio"
          defaultValue={snapshot.status.genderType}
          onChange={(event) => {
            store.status.genderType = event.target.value;
            utils.setValueByStorage(
              Const.Storage_Key_Map.Gender_Type,
              store.status.genderType
            );
            Tools.reset();
          }}
        >
              <Radio.Button value={Const.Gender_Type.偏男宝}>
                {Const.Gender_Type.偏男宝}
                <Tip title="男宝的姓名一般以二/四声结尾, 简洁有力, 三声亦可" />
              </Radio.Button>
              <Radio.Button value={Const.Gender_Type.偏女宝}>
                {Const.Gender_Type.偏女宝}
                <Tip title="女宝的姓名一般以一声结尾, 温文尔雅, 三声亦可" />
              </Radio.Button>
              <Radio.Button value={Const.Gender_Type.都看看}>
                {Const.Gender_Type.都看看}
              </Radio.Button>
            </Radio.Group>
          </div>
        </Col>
      </Row>
      
      <Divider
        style={{
          margin: "12px 0px",
        }}
      ></Divider>

      <div>
        <Typography>
          <Typography.Title level={5}>候选字库</Typography.Title>
        </Typography>
        <List
          itemLayout="horizontal"
          grid={{ gutter: 16, xxl: 6, xl: 6, md: 3, lg: 5, column: 3 }}
          dataSource={listConfigList}
          renderItem={(item, index) => (
            <List.Item
              className={
                item.title === snapshot.status.currentTab ? "selected" : ""
              }
              onClick={() => {
                // @ts-ignore
                store.status.currentTab = item.title;
                utils.setValueByStorage(Const.Storage_Key_Map.当前候选字库, item.title);
                Tools.reset();

                if (item.title === Const.Choose_Type_Option["自定义名字库"]) {
                  if (customNameList.length === 0) {
                    message.info("自定义名字库暂无数据，请先导入或添加名字");
                  } else {
                    message.info(`当前自定义名字库共有 ${customNameList.length} 条记录`);
                  }
                }
              }}
            >
              <Card hoverable type="inner" title={item.title}>
                <Card.Meta description={item.description} />
                <Typography>
                  <Typography.Paragraph>
                    {item.comment}
                    {item.optionCount > 0 ? ` , 共${item.optionCount}项` : ""}
                  </Typography.Paragraph>
                </Typography>
              </Card>
            </List.Item>
          )}
        />
      </div>
      <p></p>
            {/* 黑名单和喜欢名单管理区域 */}
      <div style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card 
              title={
                <span>
                  黑名单
                  <Tip title="添加到黑名单的名字不会出现在生成的候选名中"></Tip>
                </span>
              } 
              size="small" 
              extra={
                <Button 
                  size="small" 
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空黑名单？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateBlacklist([]);
                        message.success('黑名单已清空');
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      },
                    });
                  }}
                >
                  清空
                </Button>
              }
            >
              <div style={{ marginBottom: '8px' }}>
                <Input
                  placeholder="输入名字后按回车添加"
                  size="small"
                  onPressEnter={(e) => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      // 检查是否已存在
                      if (!blacklist.includes(value)) {
                        // 检查是否在喜欢名单中
                        if (likelist.includes(value)) {
                          // 从喜欢名单中移除
                          const newLikelist = likelist.filter((item: string) => item !== value);
                          updateLikelist(newLikelist);
                          message.warning(`"${input_姓氏}${value}" 已从喜欢名单移除并加入黑名单`);
                        } else {
                          message.success(`已将 "${input_姓氏}${value}" 加入黑名单`);
                        }
                        
                        const newBlacklist = [...blacklist, value];
                        updateBlacklist(newBlacklist);
                        
                        // 重新生成候选名
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      } else {
                        message.info(`"${input_姓氏}${value}" 已在黑名单中`);
                      }
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {blacklist.length > 0 ? (
                  <>
                    {blacklistPreview.map((name: string, index: number) => (
                      <Tag 
                        key={`${name}-${index}`} 
                        color="red" 
                        closable
                        onClose={() => {
                          const newBlacklist = blacklist.filter((item: string) => item !== name);
                          updateBlacklist(newBlacklist);
                          message.success(`已从黑名单移除 "${input_姓氏}${name}"`);
                          document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                        }}
                      >
                        {input_姓氏}{name}
                      </Tag>
                    ))}
                    {blacklistHasMore && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setBlacklistModalOpen(true)}>
                          还有 {blacklist.length - MAX_TAG_PREVIEW} 个，查看全部
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无黑名单</span>
                )}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              title={
                <span>
                  喜欢名单
                  <Tip title="仅用于记录，不参与候选名生成"></Tip>
                </span>
              } 
              size="small"
              extra={
                <Button 
                  size="small" 
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空喜欢名单？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateLikelist([]);
                        message.success('喜欢名单已清空');
                      },
                    });
                  }}
                >
                  清空
                </Button>
              }
            >
              <div style={{ marginBottom: '8px' }}>
                <Input
                  placeholder="输入名字后按回车添加"
                  size="small"
                  onPressEnter={(e) => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      // 检查是否已存在
                      if (!likelist.includes(value)) {
                        // 检查是否在黑名单中
                        if (blacklist.includes(value)) {
                          // 从黑名单中移除
                          const newBlacklist = blacklist.filter((item: string) => item !== value);
                          updateBlacklist(newBlacklist);
                          message.warning(`"${input_姓氏}${value}" 已从黑名单移除并加入喜欢名单`);
                          // 重新生成候选名
                          document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                        } else {
                          message.success(`已将 "${input_姓氏}${value}" 加入喜欢名单`);
                        }
                        
                        const newLikelist = [...likelist, value];
                        updateLikelist(newLikelist);
                      } else {
                        message.info(`"${input_姓氏}${value}" 已在喜欢名单中`);
                      }
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {likelist.length > 0 ? (
                  <>
                    {likelistPreview.map((name: string, index: number) => (
                      <Tag 
                        key={`${name}-${index}`} 
                        color="green" 
                        closable
                        onClose={() => {
                          const newLikelist = likelist.filter((item: string) => item !== name);
                          updateLikelist(newLikelist);
                          message.success(`已从喜欢名单移除 "${input_姓氏}${name}"`);
                        }}
                      >
                        {input_姓氏}{name}
                      </Tag>
                    ))}
                    {likelistHasMore && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setLikelistModalOpen(true)}>
                          还有 {likelist.length - MAX_TAG_PREVIEW} 个，查看全部
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无喜欢名单</span>
                )}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              title={
                <span>
                  单字黑名单
                  <Tip title="添加到单字黑名单的字不会出现在生成的候选名中"></Tip>
                </span>
              } 
              size="small"
              extra={
                <Button 
                  size="small" 
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空单字黑名单？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateCharBlacklist([]);
                        message.success('单字黑名单已清空');
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      },
                    });
                  }}
                >
                  清空
                </Button>
              }
            >
              <div style={{ marginBottom: '8px' }}>
                <Input
                  placeholder="输入单字后按回车添加"
                  size="small"
                  onPressEnter={(e) => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      // 检查是否为单个字符
                      if (value.length === 1) {
                        // 检查是否已存在
                        if (!charBlacklist.includes(value)) {
                          // 检查是否在单字喜欢名单中
                          if (charLikelist.includes(value)) {
                            // 从单字喜欢名单中移除
                            const newCharLikelist = charLikelist.filter((item: string) => item !== value);
                            updateCharLikelist(newCharLikelist);
                            message.warning(`字 "${value}" 已从单字喜欢名单移除并加入单字黑名单`);
                          } else {
                            message.success(`已将字 "${value}" 加入单字黑名单`);
                          }
                          
                          const newCharBlacklist = [...charBlacklist, value];
                          updateCharBlacklist(newCharBlacklist);
                          
                          // 重新生成候选名
                          document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                        } else {
                          message.info(`字 "${value}" 已在单字黑名单中`);
                        }
                      } else {
                        message.warning('只能输入单个汉字');
                      }
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {charBlacklist.length > 0 ? (
                  <>
                    {charBlacklistPreview.map((char: string, index: number) => (
                      <Tag 
                        key={`${char}-${index}`} 
                        color="orange" 
                        closable
                        onClose={() => {
                          const newCharBlacklist = charBlacklist.filter((item: string) => item !== char);
                          updateCharBlacklist(newCharBlacklist);
                          message.success(`已从单字黑名单移除 "${char}"`);
                          document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                        }}
                      >
                        {char}
                      </Tag>
                    ))}
                    {charBlacklistHasMore && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setCharBlacklistModalOpen(true)}>
                          还有 {charBlacklist.length - MAX_TAG_PREVIEW} 个，查看全部
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无单字黑名单</span>
                )}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              title={
                <span>
                  单字喜欢名单
                  <Tip title="仅用于记录，不参与候选名生成"></Tip>
                </span>
              } 
              size="small"
              extra={
                <Button 
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空单字喜欢名单？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateCharLikelist([]);
                        message.success('单字喜欢名单已清空');
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      },
                    });
                  }}
                >
                  清空
                </Button>
              }
            >
              <div style={{ marginBottom: '8px' }}>
                <Input
                  placeholder="输入单字后按回车添加"
                  size="small"
                  onPressEnter={(e) => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      // 检查是否为单个字符
                      if (value.length === 1) {
                        // 检查是否已存在
                        if (!charLikelist.includes(value)) {
                          // 检查是否在单字黑名单中
                          if (charBlacklist.includes(value)) {
                            // 从单字黑名单中移除
                            const newCharBlacklist = charBlacklist.filter((item: string) => item !== value);
                            updateCharBlacklist(newCharBlacklist);
                            message.warning(`字 "${value}" 已从单字黑名单移除并加入单字喜欢名单`);
                            // 重新生成候选名
                            document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                          } else {
                            message.success(`已将字 "${value}" 加入单字喜欢名单`);
                          }
                          
                          const newCharLikelist = [...charLikelist, value];
                          updateCharLikelist(newCharLikelist);
                        } else {
                          message.info(`字 "${value}" 已在单字喜欢名单中`);
                        }
                      } else {
                        message.warning('只能输入单个汉字');
                      }
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {charLikelist.length > 0 ? (
                  charLikelist.map((char: string, index: number) => (
                    <Tag 
                      key={`${char}-${index}`} 
                      color="purple" 
                      closable
                      onClose={() => {
                        const newCharLikelist = charLikelist.filter((item: string) => item !== char);
                        updateCharLikelist(newCharLikelist);
                        message.success(`已从单字喜欢名单移除 "${char}"`);
                        // 重新生成候选名
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      }}
                    >
                      {char}
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: '#999' }}>暂无单字喜欢名单</span>
                )}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              title={
                <span>
                  已阅览名单
                  <Tip title="已阅览名单中的名字不会出现在生成的候选名中"></Tip>
                </span>
              } 
              size="small"
              extra={
                <Button 
                  size="small" 
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空已阅览名单？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateViewedList([]);
                        message.success('已阅览名单已清空');
                        document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                      },
                    });
                  }}
                >
                  清空
                </Button>
              }
            >
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {viewedList.length > 0 ? (
                  <>
                    {viewedPreview.map((name: string, index: number) => (
                      <Tag 
                        key={`${name}-${index}`} 
                        color="blue" 
                        closable
                        onClose={() => {
                          const newViewedList = viewedList.filter((item: string) => item !== name);
                          updateViewedList(newViewedList);
                          message.success(`已从已阅览名单移除 "${input_姓氏}${name}"`);
                          document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                        }}
                      >
                        {input_姓氏}{name}
                      </Tag>
                    ))}
                    {viewedHasMore && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setViewedListModalOpen(true)}>
                          还有 {viewedList.length - MAX_TAG_PREVIEW} 个，查看全部
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无已阅览名单</span>
                )}
              </div>
            </Card>
          </Col>

          <Col span={6}>
            <Card
              title={
                <span>
                  自定义名字库
                  <Tip title="选中候选字库里的“自定义名字库”时，会用这里的名字生成候选方案"></Tip>
                </span>
              }
              size="small"
              extra={
                <Space>
                  <Button size="small" onClick={importCustomNameList}>
                    导入
                  </Button>
                  <Button
                    size="small"
                    danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认清空自定义名字库？',
                      content: '清空后不可恢复',
                      okText: '确认清空',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk: () => {
                        updateCustomNameList([]);
                        message.success('自定义名字库已清空');
                      },
                    });
                  }}
                >
                  清空
                </Button>
                </Space>
              }
            >
              <div style={{ marginBottom: '8px' }}>
                <Input
                  placeholder="输入两个字的名后按回车添加"
                  size="small"
                  onPressEnter={(e) => {
                    const input = e.target as HTMLInputElement;
                    const value = utils.removeUnChineseChar(input.value.trim());
                    if (!value) return;
                    if (value.length !== 2) {
                      message.warning('仅支持两个字的名');
                      return;
                    }
                    if (customNameList.includes(value)) {
                      message.info(`"${input_姓氏}${value}" 已在自定义名字库中`);
                      return;
                    }
                    updateCustomNameList([...customNameList, value]);
                    message.success(`已添加 "${input_姓氏}${value}" 到自定义名字库`);
                    input.value = '';
                  }}
                />
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {customNameList.length > 0 ? (
                  <>
                    {customNameList.slice(0, MAX_TAG_PREVIEW).map((name: string, index: number) => (
                      <Tag
                        key={`custom-${name}-${index}`}
                        color="cyan"
                        closable
                        onClose={() => {
                          const newList = customNameList.filter((item: string) => item !== name);
                          updateCustomNameList(newList);
                          message.success(`已从自定义名字库移除 "${input_姓氏}${name}"`);
                        }}
                      >
                        {input_姓氏}{name}
                      </Tag>
                    ))}
                    {customNameList.length > MAX_TAG_PREVIEW && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setCustomNameModalOpen(true)}>
                          还有 {customNameList.length - MAX_TAG_PREVIEW} 个，查看全部
                        </Button>
                      </div>
                    )}
                    {customNameList.length <= MAX_TAG_PREVIEW && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" size="small" onClick={() => setCustomNameModalOpen(true)}>
                          查看全部
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无自定义名字库</span>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      <Row align="middle">
        <Col span={const_col_输入框_span}>
          乱序展示候选名&nbsp;
          <Switch
            onChange={(checked) => {
              store.status.enableRandomNameList = checked;
              utils.setValueByStorage(
                Const.Storage_Key_Map.是否乱序展示候选名,
                checked
              );
              if (checked) {
                store.previewNameList = [...store.previewNameList].sort(
                  () => Math.random() - 0.5
                );
              } else {
                store.previewNameList = [...store.previewNameList].sort(
                  (a, b) => {
                    let t = a.demoStr.localeCompare(b.demoStr);
                    console.log(`${a.demoStr} vs ${b.demoStr} => ${t}`);
                    return t;
                  }
                );
              }
            }}
            checked={snapshot.status.enableRandomNameList}
          ></Switch>
        </Col>
      </Row>
      <p></p>
      {ele诗云字库}
      
      <p></p>
      <div>
        <Button
          type="primary"
          shape="round"
          ghost
          icon={<DownloadOutlined />}
          disabled={totalNameList.length === 0}
          onClick={async () => {
            await utils.asyncSleep(10);
            let nameList = totalNameList;

            let columns = [];
            for (let i = 0; i < nameList.length; i++) {
              let item = nameList[i];
              columns.push(`${item.demoStr}`);
            }
            if (snapshot.status.enableRandomNameList) {
              columns.sort(() => {
                return Math.random() - 0.5;
              });
            } else {
              columns.sort((a, b) => {
                return a.localeCompare(b);
              });
            }

            let str = "姓名\n" + columns.join("\n");

            let blob = new Blob([str], {
              type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "所有可能的姓名发音列表.txt");
            message.info(
              `所有可能的姓名发音列表生成完毕, 共${nameList.length}条`
            );
          }}
        >
          下载所有姓名方案在电脑查看
        </Button>
        <Divider type="vertical"></Divider>
        <Button 
          type="primary" 
          shape="round" 
          ghost
          onClick={exportConfig}
        >
          导出配置
        </Button>
        <Divider type="vertical"></Divider>
        <Button 
          type="primary" 
          shape="round" 
          ghost
          onClick={importConfig}
        >
          导入配置
        </Button>
        <Divider type="vertical"></Divider>
        <Button 
          type="primary" 
          shape="round" 
          danger
          ghost
          onClick={showResetModal}
        >
          重置所有配置
        </Button>
        <Divider type="vertical"></Divider>
        <Button ghost type="primary" shape="round" onClick={showDrawer}>
          原理介绍
        </Button>
      </div>
      <Drawer
        size="large"
        title="原理介绍"
        placement="right"
        onClose={onClose}
        open={isOpen}
      >
        <Desc></Desc>
      </Drawer>
      
      <Modal
        title="重置所有配置"
        open={isResetModalOpen}
        onOk={resetAllConfig}
        onCancel={cancelReset}
        okText="确认重置"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要重置所有配置吗？此操作将：</p>
        <ul>
          <li>清除所有已保存的配置信息</li>
          <li>重置所有筛选条件和名单</li>
          <li>恢复到初始状态</li>
          <li>操作完成后将自动刷新页面</li>
        </ul>
        <p style={{ color: 'red' }}>此操作不可恢复，请谨慎操作！</p>
      </Modal>
      <Modal
        title={docTitle || "文档预览"}
        open={docModalOpen}
        onCancel={() => setDocModalOpen(false)}
        footer={null}
        width={800}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{docContent}</pre>
      </Modal>
      <Modal
        title="黑名单（全部）"
        open={isBlacklistModalOpen}
        onCancel={() => setBlacklistModalOpen(false)}
        footer={null}
        width={600}
      >
        {renderVirtualTagList({
          items: blacklist,
          color: "red",
          prefix: input_姓氏,
          tagsPerRow: 6,
          emptyText: "暂无黑名单",
          itemKeyPrefix: "full-black",
          onCloseItem: (name) => {
            const newBlacklist = blacklist.filter((item: string) => item !== name);
            updateBlacklist(newBlacklist);
            message.success(`已从黑名单移除 "${input_姓氏}${name}"`);
            document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
          },
        })}
      </Modal>
      <Modal
        title="喜欢名单（全部）"
        open={isLikelistModalOpen}
        onCancel={() => setLikelistModalOpen(false)}
        footer={null}
        width={600}
      >
        {renderVirtualTagList({
          items: likelist,
          color: "green",
          prefix: input_姓氏,
          tagsPerRow: 6,
          emptyText: "暂无喜欢名单",
          itemKeyPrefix: "full-like",
          onCloseItem: (name) => {
            const newLikelist = likelist.filter((item: string) => item !== name);
            updateLikelist(newLikelist);
            message.success(`已从喜欢名单移除 "${input_姓氏}${name}"`);
          },
        })}
      </Modal>
      <Modal
        title="单字黑名单（全部）"
        open={isCharBlacklistModalOpen}
        onCancel={() => setCharBlacklistModalOpen(false)}
        footer={null}
        width={600}
      >
        {renderVirtualTagList({
          items: charBlacklist,
          color: "orange",
          tagsPerRow: 12,
          emptyText: "暂无单字黑名单",
          itemKeyPrefix: "full-char-black",
          onCloseItem: (char) => {
            const newCharBlacklist = charBlacklist.filter((item: string) => item !== char);
            updateCharBlacklist(newCharBlacklist);
            message.success(`已从单字黑名单移除 "${char}"`);
            document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
          },
        })}
      </Modal>
      <Modal
        title="已阅览名单（全部）"
        open={isViewedListModalOpen}
        onCancel={() => setViewedListModalOpen(false)}
        footer={null}
        width={600}
      >
        {renderVirtualTagList({
          items: viewedList,
          color: "blue",
          prefix: input_姓氏,
          tagsPerRow: 6,
          emptyText: "暂无已阅览名单",
          itemKeyPrefix: "full-viewed",
          onCloseItem: (name) => {
            const newViewedList = viewedList.filter((item: string) => item !== name);
            updateViewedList(newViewedList);
            message.success(`已从已阅览名单移除 "${input_姓氏}${name}"`);
            document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
          },
        })}
      </Modal>

      <Modal
        title={`自定义名字库（全部，共${customNameList.length}条）`}
        open={isCustomNameModalOpen}
        onCancel={() => setCustomNameModalOpen(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 8 }}>
          <Space>
            <Button size="small" onClick={importCustomNameList}>
              导入名字文件
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认清空自定义名字库？',
                  content: '清空后不可恢复',
                  okText: '确认清空',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => {
                    updateCustomNameList([]);
                    message.success("自定义名字库已清空");
                    document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
                  },
                });
              }}
            >
              清空
            </Button>
          </Space>
        </div>
        {renderVirtualTagList({
          items: customNameList,
          color: "cyan",
          tagsPerRow: 8,
          emptyText: "暂无自定义名字库",
          itemKeyPrefix: "full-custom",
          onCloseItem: (name) => {
            const newList = customNameList.filter((item: string) => item !== name);
            updateCustomNameList(newList);
            message.success(`已从自定义名字库移除 \"${input_姓氏}${name}\"`);
            document.querySelector('button[type="primary"]')?.dispatchEvent(new Event('click'));
          },
        })}
      </Modal>
      <p>
        姓氏:{input_姓氏}
        {tip}
      </p>

      <Col span={const_col_标题_span}>
        <Button
          type="primary"
          onClick={async function () {
            if (flag已确认姓氏最后一字发音 === false) {
              message.error(
                `姓氏中的 "${char_姓_末尾字}" 为多音字, 请先确认 "${char_姓_末尾字}" 的读音`
              );
              return;
            }

            // 生成时保留旧列表，避免 "No data" 闪烁和高度跳变
            store.status.isLoading = true;
            await utils.asyncSleep(100);
            console.log("开始生成候选人名");
            let totalNameList: CommonType.Type_Name[] = [];
            const generateStart = Date.now();
            let rawNameList = utils.generateLegalNameList({
              char_姓_全部,
              char_姓_末尾字: pinyin_of_姓_末尾字,
              char_必选字_list,
              char_排除字_list,
              char_单字喜欢名单: charLikelist,
              char_自定义名字库: customNameList,
              charSpecifyPos: snapshot.status.generateConfig.charSpecifyPos,
              generateType: snapshot.status.currentTab,
              pinyinOptionList: pinyinOptionList,
              generateAll: true,
              enableFilterSamePinyinMustHaveChars: snapshot.status.enableFilterSamePinyinMustHaveChars,
              enablePhonologyCheck: snapshot.status.enablePhonologyCheck,
              phonologyChecks: snapshot.status.phonologyChecks,
            });
            const generateEnd = Date.now();
            console.log(`候选人名生成耗时: ${generateEnd - generateStart}ms`);
            store.status.isLoading = false;
            console.log("候选人名生成完毕");

            // 按性别要求进行过滤
            const genderFilterStart = Date.now();
            for (let name of rawNameList) {
              switch (snapshot.status.genderType) {
                case Const.Gender_Type.偏男宝:
                  if ([2, 3, 4].includes(name.人名_第二个字.tone)) {
                    totalNameList.push(name);
                  }
                  break;
                case Const.Gender_Type.偏女宝:
                  if ([1, 3].includes(name.人名_第二个字.tone)) {
                    totalNameList.push(name);
                  }
                  break;
                case Const.Gender_Type.都看看:
                default:
                  totalNameList.push(name);
              }
            }
            const genderFilterEnd = Date.now();
            console.log(`按性别要求过滤耗时: ${genderFilterEnd - genderFilterStart}ms`);
            console.log(`按性别要求过滤后剩余: ${totalNameList.length}`);

            // 获取黑名单和喜欢名单
            const blacklistGetStart = Date.now();
            const blacklist = JSON.parse(localStorage.getItem('nameBlacklist') || '[]');
            const likelist = JSON.parse(localStorage.getItem('nameLikelist') || '[]');
            const charBlacklist = JSON.parse(localStorage.getItem('charBlacklist') || '[]');
            const viewedList = JSON.parse(localStorage.getItem('nameViewedList') || '[]');
            const blacklistGetEnd = Date.now();
            console.log(`获取黑名单和喜欢名单耗时: ${blacklistGetEnd - blacklistGetStart}ms`);
            
            // 过滤掉黑名单中的名字和已阅览名单中的名字 - 优化版本
            const blacklistFilterStart = Date.now();
            const surnameLength = char_姓_全部.map(item => item.char).join('').length;
            
            // 将数组和Set转换为Set以提高查找性能
            const blacklistSet = new Set(blacklist);
            const viewedListSet = new Set(viewedList);
            const charBlacklistSet = new Set(charBlacklist);
            
            totalNameList = totalNameList.filter(name => {
              // 提取名字部分（去掉姓氏）
              const namePart = name.demoStr.slice(surnameLength, surnameLength + 2);
              
              // 检查是否在已阅览名单中
              if (viewedListSet.has(namePart)) {
                return false;
              }
              
              // 检查是否在黑名单中
              if (blacklistSet.has(namePart)) {
                return false;
              }
              
              const c1 = namePart[0];
              const c2 = namePart[1];
              if (charBlacklistSet.has(c1) || charBlacklistSet.has(c2)) {
                return false;
              }
              
              return true;
            });
            const blacklistFilterEnd = Date.now();
            console.log(`过滤黑名单和已阅览名单中的名字耗时: ${blacklistFilterEnd - blacklistFilterStart}ms`);
            console.log(`黑名单/已阅览/单字黑名单过滤后剩余: ${totalNameList.length}`);

            setTotalNameList(totalNameList);
            // 随机打乱
            const shuffleStart = Date.now();
            let newTotalNameList = [...totalNameList];
            if (snapshot.status.enableRandomNameList) {
              newTotalNameList.sort(() => Math.random() - 0.5);
            }
            let displayNameList = newTotalNameList.slice(0, snapshot.maxDisplayItem);
            const shuffleEnd = Date.now();
            console.log(`随机打乱耗时: ${shuffleEnd - shuffleStart}ms`);
            
            console.log("随机打乱完毕");
            
            const previewUpdateStart = Date.now();
            store.previewNameList = displayNameList;
            const previewUpdateEnd = Date.now();
            console.log(`更新预览列表耗时: ${previewUpdateEnd - previewUpdateStart}ms`);
            console.log("数据生成完毕");


            // let displayNameList = totalNameList.slice(0, snapshot.maxDisplayItem);
            // setTotalNameList(totalNameList);
            // console.log("随机打乱完毕");
            // if (snapshot.status.enableRandomNameList) {
            //   displayNameList.sort(() => Math.random() - 0.5);
            // }
            // store.previewNameList = displayNameList;
            // console.log("数据生成完毕");
          }}
        >
          生成候选方案
        </Button>
      </Col>
      
      <Card title="" variant="borderless">
        <Spin spinning={snapshot.status.isLoading} tip="生成中...">
          <NameList
            loading={snapshot.status.isLoading}
            nameList={snapshot.previewNameList as CommonType.Type_Name[]}
            columnCount={snapshot.columnCount}
            surnameLength={char_姓_全部.map(item => item.char).join('').length}
            onBlacklistChange={updateBlacklist}
            onLikelistChange={updateLikelist}
            onCharBlacklistChange={updateCharBlacklist}
            onCharLikelistChange={updateCharLikelist}
            onAddToViewedList={addCurrentPageToViewedList}
            onRemoveFromViewedList={removeCurrentPageFromViewedList}
          ></NameList>
        </Spin>
      </Card>
    </div>
  );
};
