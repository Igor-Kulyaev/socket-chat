import {Component, useCallback, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "@/utils/api";

// const style = {
//   height: 30,
//   border: "1px solid green",
//   margin: 6,
//   padding: 8
// };
//
// export default function Test() {
//   const [listMsgs, setListMsgs] = useState(Array.from({ length: 20 }));
//   const [hasMore, setHasMore] = useState(true);
//   let [listData, setListData] = useState(Array.from({ length: 500 }));
//   const fetchMoreData = useCallback(() => {
//     if (listMsgs.length >= listData.length) {
//       setHasMore(false);
//       return;
//     }
//
//     let newData = listData.slice(
//       listData.length - listMsgs.length - 25,
//       listData.length - listMsgs.length
//     );
//     // a fake async api call like which sends
//     // 20 more records in .5 secs
//
//     setTimeout(() => {
//       setListMsgs((prevState) => [...prevState, newData]);
//     }, 500);
//
//     console.log("fetchMoreData -> ", listMsgs.length);
//   }, [listMsgs, listData]);
//
//   return (
//     <div
//       className="App"
//       id="scrollableDiv"
//       style={{
//         height: 300,
//         overflow: "auto",
//         display: "flex",
//         flexDirection: "column-reverse"
//       }}
//     >
//       {/*Put the scroll bar always on the bottom*/}
//       <InfiniteScroll
//         dataLength={listMsgs.length}
//         next={fetchMoreData}
//         hasMore={hasMore}
//         style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
//         inverse={true} //
//         loader={<h4>Loading...</h4>}
//         scrollableTarget="scrollableDiv"
//         endMessage={
//           <p style={{ textAlign: "center" }}>
//             <b>Yay! You have seen it all</b>
//           </p>
//         }
//       >
//         {listMsgs.map((i, index) => (
//           <div style={style} key={index}>
//             div - #{index}
//           </div>
//         ))}
//       </InfiniteScroll>
//     </div>
//   );
// }

const style = {
  height: 100,
  border: "1px solid green",
  margin: 6,
  padding: 8
};

const initialItems = Array.from({ length: 10 });
const App = () => {
  const [items, setItems] = useState(initialItems);

  const fetchMoreData = async () => {
    console.log('fetchMoreData');
    try {
      const result = await api.get('chat-messages', {
        params: {
          recipientId: "6523f0684dcf928861788fc7",
          lastMessageId: items[items.length - 1]?._id || "65290c00348c1db2261fc701",
        }
      });
      if (result.data.messages.length < 10) {
        // setHasMore(false);
      }
      setItems((prev) => [...prev, ...result.data.messages]);
    } catch (error) {

    }
  }

  // const fetchMoreData = () => {
  //   // a fake async api call like which sends
  //   // 20 more records in 1.5 secs
  //   setTimeout(() => {
  //     setItems((prev) => [...prev, ...Array.from({ length: 10 })]);
  //   }, 1500);
  // };

  return (
    <div>
      <h1>demo: react-infinite-scroll-component</h1>
      <hr />
      <div id="scrollableDiv" style={{ height: "65vh", overflow: "auto",
        display: "flex",
        flexDirection: "column-reverse" }}>
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMoreData}
          inverse={true}
          hasMore={true}
          style= {{
            display: "flex",
            flexDirection: "column-reverse"
          }}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {items.map((i, index) => (
            <div style={style} key={index}>
              div - #{index}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default function Test() {
  return <App />
}