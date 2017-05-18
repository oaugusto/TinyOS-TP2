import java.io.IOException;
//import java.net.ServerSocket;
//import java.net.Socket;
//import java.util.Scanner;

import net.tinyos.message.Message;
import net.tinyos.message.MessageListener;
import net.tinyos.message.MoteIF;
import net.tinyos.packet.BuildSource;
import net.tinyos.packet.PhoenixSource;
import net.tinyos.util.PrintStreamMessenger;

public class BaseStationApp implements MessageListener{

	private static BaseStationApp baseStation;
	private static MoteIF moteConnection;
	
	public static PhoenixSource phoenix;
	public static String source; 
	
	public static int version = 0;
	
	public void startServer() throws IOException {
		/*
		ServerSocket servidor = new ServerSocket(12345);
		System.out.println("Porta 12345 aberta!");
     
		Socket cliente = servidor.accept();
		System.out.println("Nova conex�o com o cliente " +   
				cliente.getInetAddress().getHostAddress()
				);
     
		Scanner s = new Scanner(cliente.getInputStream());
		
		if (s.toString().equals("RequestTopo")) {
			RequestTopo rqstMsg = new RequestTopo();
			rqstMsg.set_seqno(version++);
			baseStation.sendMessageToMote(rqstMsg);
		}
		
		if (s.toString().equals("RequestData")) {
			RequestData rqstMsg = new RequestData();
			rqstMsg.set_seqno(version++);
			baseStation.sendMessageToMote(rqstMsg);
		}
		
		System.out.println("Request sent");
		
		while (s.hasNextLine()) {
			System.out.println(s.nextLine());
		}
     
		s.close();
		servidor.close();
		cliente.close();
	*/
	}
	
	private static BaseStationApp getInstance() {
		if (baseStation == null) {
			baseStation = new BaseStationApp();
		}
		return baseStation;
	}
	
	private static MoteIF getMoteInstance() {
		if (moteConnection == null) {
			moteConnection = new MoteIF(phoenix);
		}
		return moteConnection;	
	}
	
	private BaseStationApp() {
		MoteIF mote = getMoteInstance();
		mote.registerListener(new ReplyData(), this);
		mote.registerListener(new ReplyTopo(), this);
	}
	
	@Override
	public void messageReceived(int destAddr, Message msg) {
		
		if (msg instanceof ReplyTopo) {
			ReplyTopo rcv = (ReplyTopo)msg;
			
			System.out.println("Message received:\n" 
					+ "source: " + rcv.get_origem() + "\n"
					+ "type: "   + rcv.amType()     + "\n"
					+ "parent: " + rcv.get_parent() + "\n"
					+ "seq: "    + rcv.get_seqno());
		
		}
		
		if (msg instanceof ReplyData) {
			ReplyData rcv = (ReplyData)msg;
			
			System.out.println("Message received:\n" 
					+ "source: "     + rcv.get_origem() + "\n"
					+ "type: "       + rcv.amType()     + "\n"
					+ "luminosity: " + rcv.get_data_luminosity() + "\n"
					+ "temperature"  + rcv.get_data_temperature() + "\n"
					+ "seq: "    + rcv.get_seqno());
		}
		
	}

	public void sendMessageToMote(Message msg){
		if (msg != null){
			try {
				MoteIF mote = getMoteInstance();
				mote.send(MoteIF.TOS_BCAST_ADDR, msg);
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			System.out.println("MoteMsg is null");
		}
	}
	
	public static void usage() {
		System.out.println("usage: BaseStationApp [-comm <source>]");
	}
	
	public static void main(String[] args) throws Exception {
	    if (args.length == 2) {
	      if (!args[0].equals("-comm")) {
		       usage();
		       System.exit(1);
	      }
	      source = args[1];
	    }

	    if (source == null) {
	      phoenix = BuildSource.makePhoenix(PrintStreamMessenger.err);
	    }
	    else {
	      phoenix = BuildSource.makePhoenix(source, PrintStreamMessenger.err);
	    }
	    
	    System.out.print(phoenix);
		  
		BaseStationApp base = new BaseStationApp();
		base.startServer();
	}
	
}
