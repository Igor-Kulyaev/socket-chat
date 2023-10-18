import {drawerWidth} from "@/shared/constants/constants";
import Box from "@mui/material/Box";
import {Chip, CircularProgress, FormHelperText, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import InfiniteScroll from "react-infinite-scroll-component";
import {ChatMessage} from "@/entities/ChatMessage/ChatMessage";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {messageSchema} from "@/shared/schemas/schemas";
import {useAuthorization} from "@/hooks/useAuthorization";
import {useCallback, useRef} from "react";
import {debounce} from "lodash";

const PreviousMessagesLoader = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: "center", marginBottom: "20px" }}>
      <CircularProgress sx={{color: "#faf4cb"}} />
    </Box>
  )
}

export const Chat = ({
  recipient,
  closeChat,
  messages,
  fetchMoreData,
  hasMore,
  setError,
  setMessages,
}) => {
  const latestMessageRef = useRef();
  const {authUser, setAuthUser, socket, setSocket} = useAuthorization();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(messageSchema),
  });

  const debouncedScrollToLatestMessage = useCallback(
    debounce(() => {
      if (latestMessageRef.current) {
        latestMessageRef.current.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 300),
    []
  );

  const onSubmit = async (data) => {
    if (recipient) {
      const formData = {
        message: data.message,
        to: recipient
      }
      socket.emit('message', formData, (error, savedMessage) => {
        if (error) {
          setError(error);
        } else {
          setMessages(prev => [savedMessage, ...prev]);
          debouncedScrollToLatestMessage();
        }
      });
    }
  }

  return (
    <Box sx={{
      margin: "10px",
      marginLeft: `${drawerWidth + 10}px`,
    }}>
      {recipient && (
        <>
          <Box>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
              <Chip label={`You are chatting with ${recipient.firstName} ${recipient.lastName}`} color="primary" />
              <Button variant="contained" color="inherit" onClick={closeChat}>Close chat</Button>
            </Box>
          </Box>
          <div id="scrollableDiv" style={{ height: "65vh", overflow: "auto",
            display: "flex",
            flexDirection: "column-reverse" }}>
            {!!messages.length && (
              <InfiniteScroll
                dataLength={messages.length}
                next={fetchMoreData}
                inverse={true}
                hasMore={hasMore}
                style= {{
                  display: "flex",
                  flexDirection: "column-reverse"
                }}
                loader={<PreviousMessagesLoader />}
                scrollableTarget="scrollableDiv"
              >
                <div style={{width: "100%", height: "10px", marginTop: "20px"}} ref={latestMessageRef}/>
                {messages.map((message, index) => (
                  <ChatMessage key={message._id} message={message} recipient={recipient} />
                ))}
              </InfiniteScroll>
            )}
          </div>
          <Box
            sx={{
              marginTop: "auto",
              height: "20vh",
              display: "flex",
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{display: "flex", justifyContent: "center"}}>
                <TextField
                  label="Message"
                  multiline
                  rows={5}
                  variant="filled"
                  {...register("message")}
                  sx={{
                    width: "450px",
                    backgroundColor: "#ecfefa",
                    borderRadius: "5px"
                  }}
                />
                <Button variant="contained" type="submit" sx={{marginLeft: "25px"}}>Send</Button>
              </Box>
              <Box sx={{display: "flex", justifyContent: "start"}}>
                {errors.message?.message && <FormHelperText sx={{color: "#faf4cb"}}>{errors.message?.message}</FormHelperText>}
              </Box>
            </form>
          </Box>
        </>
      )}
    </Box>
  )
}
