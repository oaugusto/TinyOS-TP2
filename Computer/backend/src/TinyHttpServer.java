import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/actions")
public class TinyHttpServer {

	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());

	@OnOpen
	public void onOpen(Session session){
		System.out.println(session.getId() + " connection open.");
		try {
			session.getBasicRemote().sendText("{\"event\":\"Connection open.\"}");
		} catch (Exception e) {
			e.printStackTrace();
		}
		sessions.add(session);
	}

	@OnMessage
	public void onMessage(String message, Session session) {
		System.out.println("Message from " + session.getId() + " : " + message);
		System.out.println(message);
		/*
		//here we have to deal with two types of message:
		 * request topo
		 * request data
		
		*if (type of RequestTopo)
		MoteQuestionMsg moteQuestionMsg = MessageDecoder.decodeJson(message);
		BaseStationApp.getInstance().sendMessageToMote(moteQuestionMsg);
		System.out.println("fim");
		*/
	}

	@OnClose
	public void onClose(Session session){
		System.out.println("Session " + session.getId() + " was closed.");
	}

	
	@OnError
	public void onError(Throwable error){

	}
	

	public static void sendMessageToAll(String msg){
		for (Session s : sessions){
			if (s != null && s.isOpen()){
				try {
					System.out.println(msg);
					s.getBasicRemote().sendText(msg);
				} catch (IOException e) {
					//e.printStackTrace();
					System.out.println("Failed in send message.");
					}
				}
			}
		}
}
